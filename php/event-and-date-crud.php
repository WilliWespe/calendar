<?php

// A database connection is required to run the here implemented functions
require_once 'get-db-connection.php';

/**
 * Create a new event with optional date range(s).
 *
 * @param array $postData The entire $_POST array passed from the router.
 * @return string The new event_id
 * @throws Exception On validation errors or DB failures
 */
function addEvent(array $postData): string {
    $eventData = $postData['eventData'] ?? [];
    $eventDateRanges = $postData['eventDateRanges'] ?? null;

    $pdo = getPDO();
    $isNestedTransaction = $pdo->inTransaction();
    if (!$isNestedTransaction) {
        $pdo->beginTransaction();
    }

    try {
        // Validate required fields
        foreach (['event_description', 'event_type'] as $field) {
            if (empty($eventData[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $eventId = $pdo->query("SELECT UUID()")->fetchColumn();
        $includeEventInMail = (int)(bool)($eventData['include_event_in_mail'] ?? false);
        $eventDotColor = !empty($eventData['event_dot_color']) ? $eventData['event_dot_color'] : null;

        // --- ENCRYPT DESCRIPTION ---
        $encryptedEventDescription = encryptDescription($eventData['event_description']);

        $stmt = $pdo->prepare(
            "INSERT INTO events (event_id, event_description, event_type, event_dot_color, include_event_in_mail)
             VALUES (:event_id, :event_description, :event_type, :event_dot_color, :include_event_in_mail)"
        );
        $stmt->execute([
            ':event_id' => $eventId,
            ':event_description' => $encryptedEventDescription,  
            ':event_type' => $eventData['event_type'],          
            ':event_dot_color' => $eventDotColor, // 3. Insert the parsed variable
            ':include_event_in_mail' => $includeEventInMail
        ]);

        // Add date ranges if provided
        if ($eventDateRanges !== null) {
            foreach ($eventDateRanges as $range) {
                if (!isset($range['start'])) {
                    throw new Exception("Date range must include 'start'");
                }
                $start = $range['start'];
                $end = $range['end'] ?? $start;
                addDateToEvent($eventId, $start, $end);
            }
        }

        if (!$isNestedTransaction) {
            $pdo->commit();
        }
        return $eventId;
    } catch (Exception $e) {
        if (!$isNestedTransaction) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

/**
 * Delete an event and ALL its associated data (ranges + ordering) via cascading foreign keys.
 *
 * @param array $postData The entire $_POST array passed from the router.
 * @return void
 * @throws Exception If eventId is missing or the event is not found
 */
function deleteEvent(array $postData): void {
    $eventId = $postData['eventId'] ?? '';

    if (empty($eventId)) {
        throw new Exception("No eventId passed");
    }

    $pdo = getPDO();
    $isNestedTransaction = $pdo->inTransaction();
    if (!$isNestedTransaction) {
        $pdo->beginTransaction();
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM events WHERE event_id = :event_id");
        $stmt->execute([':event_id' => $eventId]);

        if ($stmt->rowCount() === 0) {
            throw new Exception("Event not found");
        }

        if (!$isNestedTransaction) {
            $pdo->commit();
        }
    } catch (Exception $e) {
        if (!$isNestedTransaction) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

/* ---------------------------------------------------------------------------------------- */

/**
 * Add a date or date range to an event.
 * Automatically merges with existing ranges if they overlap or are adjacent.
 *
 * @param string $eventId
 * @param string $startDate (YYYY-MM-DD)
 * @param string|null $endDate (YYYY-MM-DD, optional; if null, treats as single day)
 * @throws Exception On invalid dates or overlaps
 */
function addDateToEvent(string $eventId, string $startDate, ?string $endDate = null): void {
    $pdo = getPDO();
    
    // Check if a transaction is already running from a parent function
    $isNestedTransaction = $pdo->inTransaction();
    if (!$isNestedTransaction) {
        $pdo->beginTransaction();
    }
    
    try {
        $newStart = new DateTime($startDate);
        $newEnd = $endDate ? new DateTime($endDate) : clone $newStart;

        if ($newStart > $newEnd) {
            throw new Exception("Start date must be <= end date");
        }

        /*
        // Check if ANY date in the new range already exists for this event
        $stmtExisting = $pdo->prepare(
            "SELECT 1 FROM event_date_ranges
             WHERE event_id = :event_id
               AND start_date <= :new_end
               AND end_date >= :new_start"
        );
        $stmtExisting->execute([
            ':event_id' => $eventId,
            ':new_end' => $newEnd->format('Y-m-d'),
            ':new_start' => $newStart->format('Y-m-d')
        ]);
        
        if ($stmtExisting->fetch()) {
            throw new Exception("Event already exists on one or more dates in this range");
        }
        */

        // Find ALL ranges that overlap or are adjacent to the new range
        $stmtAllRanges = $pdo->prepare(
            "SELECT range_id, start_date, end_date
             FROM event_date_ranges
             WHERE event_id = :event_id"
        );
        $stmtAllRanges->execute([':event_id' => $eventId]);
        $allRanges = $stmtAllRanges->fetchAll(PDO::FETCH_ASSOC);

        $rangesToMerge = [];
        foreach ($allRanges as $range) {
            $start = new DateTime($range['start_date']);
            $end = new DateTime($range['end_date']);

            // Check for overlap or adjacency (within ±1 day)
            $checkStart = (clone $start)->modify('-1 day');
            $checkEnd   = (clone $end)->modify('+1 day');

            if ($newEnd >= $checkStart && $newStart <= $checkEnd) {
                $rangesToMerge[] = $range;
            }
        }

        // Calculate the FINAL MERGED RANGE
        $finalStart = clone $newStart;
        $finalEnd = clone $newEnd;

        foreach ($rangesToMerge as $range) {
            $start = new DateTime($range['start_date']);
            $end = new DateTime($range['end_date']);
            if ($start < $finalStart) $finalStart = clone $start;
            if ($end > $finalEnd) $finalEnd = clone $end;
        }

        // Delete all ranges that will be merged
        if (!empty($rangesToMerge)) {
            // Prepare ONCE outside the loop for performance
            $stmtDelete = $pdo->prepare("DELETE FROM event_date_ranges WHERE range_id = :range_id");
            foreach ($rangesToMerge as $range) {
                $stmtDelete->execute([':range_id' => $range['range_id']]);
            }
        }

        // Create the new merged range
        $rangeId = $pdo->query("SELECT UUID()")->fetchColumn();
        $stmtInsertRange = $pdo->prepare(
            "INSERT INTO event_date_ranges (range_id, event_id, start_date, end_date)
             VALUES (:range_id, :event_id, :start_date, :end_date)"
        );
        $stmtInsertRange->execute([
            ':range_id' => $rangeId,
            ':event_id' => $eventId,
            ':start_date' => $finalStart->format('Y-m-d'),
            ':end_date' => $finalEnd->format('Y-m-d')
        ]);

        // Ensure ordering exists for EVERY UNIQUE MM-DD in the final range
        $current = clone $finalStart;
        $endLoop = clone $finalEnd;
        $processedMM_DD = []; 
        
        // Prepare ordering queries ONCE before the loop
        $stmtCheckOrdering = $pdo->prepare(
            "SELECT 1 FROM event_ordering
             WHERE event_id = :event_id AND month = :month AND day = :day"
        );
        
        $stmtGetPosition = $pdo->prepare(
            "SELECT COALESCE(MAX(position), 0) + 1
             FROM event_ordering
             WHERE month = :month AND day = :day"
        );
        
        $stmtInsertOrdering = $pdo->prepare(
            "INSERT INTO event_ordering (ordering_id, event_id, month, day, position)
             VALUES (:ordering_id, :event_id, :month, :day, :position)"
        );

        while ($current <= $endLoop) {
            $month = (int)$current->format('n');
            $day = (int)$current->format('j');
            $mm_dd = "$month-$day";

            if (in_array($mm_dd, $processedMM_DD)) {
                $current->add(new DateInterval('P1D'));
                continue;
            }
            $processedMM_DD[] = $mm_dd;

            // Check if ordering already exists
            $stmtCheckOrdering->execute([
                ':event_id' => $eventId, 
                ':month' => $month, 
                ':day' => $day
            ]);
            
            if (!$stmtCheckOrdering->fetch()) {
                // Get next available position
                $stmtGetPosition->execute([':month' => $month, ':day' => $day]);
                $position = $stmtGetPosition->fetchColumn();
                
                $orderingId = $pdo->query("SELECT UUID()")->fetchColumn();
                
                // Insert ordering
                $stmtInsertOrdering->execute([
                    ':ordering_id' => $orderingId,
                    ':event_id' => $eventId,
                    ':month' => $month,
                    ':day' => $day,
                    ':position' => $position
                ]);
            }
            $current->add(new DateInterval('P1D'));
        }

        // Only commit if this function started the transaction
        if (!$isNestedTransaction) {
            $pdo->commit();
        }
    } catch (Exception $e) {
        // Only roll back if this function started the transaction
        if (!$isNestedTransaction) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

/**
 * Add a new event type to the event_types table.
 *
 * @param array $postData The $_POST array containing 'eventType'
 * @return string The new event_type_id (UUID)
 * @throws Exception If the type already exists or input is invalid
 */
function addEventType(array $postData): string {
    // Extract the string from the POST array
    $eventType = $postData['eventType'] ?? '';
    $eventTypeBackgroundColor = !empty($postData['eventBackgroundColor']) ? $postData['eventBackgroundColor'] : null;
    
    if (empty($eventType)) {
        throw new Exception("Event type cannot be empty.");
    }

    $pdo = getPDO();
    $isNestedTransaction = $pdo->inTransaction();
    if (!$isNestedTransaction) {
        $pdo->beginTransaction();
    }
    try {
        // Check if type already exists using a prepared statement
        $stmt = $pdo->prepare("SELECT event_type_id FROM event_types WHERE event_type = :event_type");
        $stmt->execute([':event_type' => $eventType]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
            throw new Exception("Event type '$eventType' already exists. ID: $existingId");
        }

        $eventTypeId = $pdo->query("SELECT UUID()")->fetchColumn();
        
        // Insert using a prepared statement
        $stmtInsert = $pdo->prepare(
        "INSERT INTO event_types (event_type_id, event_type, event_type_background_color)
         VALUES (:event_type_id, :event_type, :event_type_background_color)"
    );
    $stmtInsert->execute([
        ':event_type_id' => $eventTypeId,
        ':event_type' => $eventType,
        ':event_type_background_color' => $eventTypeBackgroundColor
    ]);

        if (!$isNestedTransaction) {
            $pdo->commit();
        }
        return $eventTypeId;
    } catch (Exception $e) {
        if (!$isNestedTransaction) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

/**
 * Fetches all calendar data (events, date ranges, and orderings) in a single query batch.
 * 
 * Automatically decrypts event descriptions before returning.
 *
 * @return array{events: array, dateRanges: array, orderings: array, eventTypes: array} Associative array of calendar data.
 * @throws PDOException If a database query fails.
 * @throws Exception If description decryption fails.
 */
function getAllCalendarData(): array {
    $pdo = getPDO();

    // 1. Get all events (with type names)
    $events = $pdo->query(
        "SELECT e.*, et.event_type AS event_type_name
         FROM events e
         JOIN event_types et ON e.event_type = et.event_type_id"
    )->fetchAll(PDO::FETCH_ASSOC);

    // --- DECRYPT ALL DESCRIPTIONS ---
    foreach ($events as &$event) {
        $event['event_description'] = decryptDescription($event['event_description']);
    }

    // 2. Get all date ranges
    $eventDateRanges = $pdo->query(
        "SELECT * FROM event_date_ranges"
    )->fetchAll(PDO::FETCH_ASSOC);

    // 3. Get all orderings
    $orderings = $pdo->query(
        "SELECT * FROM event_ordering"
    )->fetchAll(PDO::FETCH_ASSOC);

    // 4. Get all event type
    $eventTypes = $pdo->query(
        "SELECT * FROM event_types"
    )->fetchAll(PDO::FETCH_ASSOC);

    return [
        'events' => $events,
        'eventDateRanges' => $eventDateRanges,
        'orderings' => $orderings,
        'eventTypes' => $eventTypes
    ];
}

?>