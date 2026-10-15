<?php

// A database connection is required to run the here implemented functions
require_once 'get-db-connection.php';

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Create a new event with optional date range(s).
 *
 * @param array $postData The $_POST array containing 'eventData' and 'eventDateRanges'.
 * @return string The newly generated event_id UUID.
 * @throws Exception On validation errors or DB failures.
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
        foreach (['event_description', 'event_type'] as $field) {
            if (empty($eventData[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $eventId = $pdo->query("SELECT UUID()")->fetchColumn();
        $includeEventInMail = (int)(bool)($eventData['include_event_in_mail'] ?? false);
        $eventDotColor = !empty($eventData['event_dot_color']) ? $eventData['event_dot_color'] : null;

        $encryptedEventDescription = encryptDescription($eventData['event_description']);

        $stmt = $pdo->prepare(
            "INSERT INTO events (event_id, event_description, event_type, event_dot_color, include_event_in_mail)
             VALUES (:event_id, :event_description, :event_type, :event_dot_color, :include_event_in_mail)"
        );
        $stmt->execute([
            ':event_id' => $eventId,
            ':event_description' => $encryptedEventDescription,  
            ':event_type' => $eventData['event_type'],          
            ':event_dot_color' => $eventDotColor,
            ':include_event_in_mail' => $includeEventInMail
        ]);

        if ($eventDateRanges !== null) {
            foreach ($eventDateRanges as $range) {
                if (!isset($range['start'])) {
                    throw new Exception("Date range must include 'start'");
                }
                $start = $range['start'];
                $end = $range['end'] ?? $start;
                
                // Pass as an array instead of discrete string arguments
                addDateToEvent([
                    'eventId' => $eventId,
                    'startDate' => $start,
                    'endDate' => $end
                ]);
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

/* ---------------------------------------------------------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Edit an existing event's details.
 *
 * @param array $postData The entire $_POST array passed from the router.
 * @return void
 * @throws Exception On validation errors or DB failures
 */
function editEvent(array $postData): void {
    $eventId = $postData['eventId'] ?? '';
    $eventData = $postData['eventData'] ?? [];

    if (empty($eventId)) {
        throw new Exception("Missing eventId.");
    }

    // Validate required fields
    foreach (['event_description', 'event_type'] as $field) {
        if (empty($eventData[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $pdo = getPDO();
    
    // Safely capture the optional dot color, falling back to null
    $eventDotColor = !empty($eventData['event_dot_color']) ? $eventData['event_dot_color'] : null;
    $includeEventInMail = (int)(bool)($eventData['include_event_in_mail'] ?? false);

    // --- ENCRYPT DESCRIPTION ---
    $encryptedEventDescription = encryptDescription($eventData['event_description']);

    $stmt = $pdo->prepare(
        "UPDATE events 
         SET event_description = :event_description,
             event_type = :event_type,
             event_dot_color = :event_dot_color,
             include_event_in_mail = :include_event_in_mail
         WHERE event_id = :event_id"
    );
    
    $stmt->execute([
        ':event_description' => $encryptedEventDescription,
        ':event_type' => $eventData['event_type'],
        ':event_dot_color' => $eventDotColor, 
        ':include_event_in_mail' => $includeEventInMail,
        ':event_id' => $eventId
    ]);

    // Note: We don't throw an error on rowCount() === 0 because that just means 
    // the user clicked "save" without actually changing any data.
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Add a date or date range to an event. 
 * Relies on the centralized reconcile helper for merging overlaps and generating orderings.
 *
 * @param array $postData Contains 'eventId', 'startDate', and optional 'endDate'.
 * @return void
 * @throws Exception On invalid dates.
 */
function addDateToEvent(array $postData): void {
    $eventId = $postData['eventId'] ?? '';
    $startDate = $postData['startDate'] ?? '';
    $endDate = !empty($postData['endDate']) ? $postData['endDate'] : null;

    if (empty($eventId) || empty($startDate)) {
        throw new Exception("Missing required eventId or startDate.");
    }

    $pdo = getPDO();
    
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

        // 1. Insert the raw unmerged range
        $rangeId = $pdo->query("SELECT UUID()")->fetchColumn();
        $stmtInsert = $pdo->prepare(
            "INSERT INTO event_date_ranges (range_id, event_id, start_date, end_date)
             VALUES (:range_id, :event_id, :start_date, :end_date)"
        );
        $stmtInsert->execute([
            ':range_id' => $rangeId,
            ':event_id' => $eventId,
            ':start_date' => $newStart->format('Y-m-d'),
            ':end_date' => $newEnd->format('Y-m-d')
        ]);

        // 2. Centralized merge and order synchronization
        reconcileEventRangesAndOrdering($eventId, $pdo);

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

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Edits an existing date range limits and reconciles the event's overall schedule.
 *
 * @param array $postData Contains 'rangeId', 'eventId', 'startDate', and 'endDate'.
 * @return void
 * @throws Exception On invalid input or DB failure.
 */
function editEventDateRange(array $postData): void {
    $rangeId = $postData['rangeId'] ?? '';
    $eventId = $postData['eventId'] ?? '';
    $startDate = $postData['startDate'] ?? '';
    $endDate = $postData['endDate'] ?? '';

    if (empty($rangeId) || empty($eventId) || empty($startDate) || empty($endDate)) {
        throw new Exception("Missing parameters for editing date range.");
    }
    
    if (new DateTime($startDate) > new DateTime($endDate)) {
        throw new Exception("Start date must be <= end date");
    }

    $pdo = getPDO();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            "UPDATE event_date_ranges 
             SET start_date = :start, end_date = :end 
             WHERE range_id = :range_id AND event_id = :event_id"
        );
        $stmt->execute([
            ':start' => $startDate,
            ':end' => $endDate,
            ':range_id' => $rangeId,
            ':event_id' => $eventId
        ]);

        reconcileEventRangesAndOrdering($eventId, $pdo);
        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Deletes a specific date range and cleans up subsequent ordering gaps.
 *
 * @param array $postData Contains 'rangeId' and 'eventId'.
 * @return void
 * @throws Exception On invalid input or DB failure.
 */
function deleteEventDateRange(array $postData): void {
    $rangeId = $postData['rangeId'] ?? '';
    $eventId = $postData['eventId'] ?? '';

    if (empty($rangeId) || empty($eventId)) {
        throw new Exception("Missing parameters for deleting date range.");
    }

    $pdo = getPDO();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            "DELETE FROM event_date_ranges 
             WHERE range_id = :range_id AND event_id = :event_id"
        );
        $stmt->execute([
            ':range_id' => $rangeId,
            ':event_id' => $eventId
        ]);

        reconcileEventRangesAndOrdering($eventId, $pdo);
        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/* ---------------------------------------------------------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Changes the order of an event on a specific day by swapping it with an adjacent event.
 *
 * @param array $postData Contains eventId, month, day, and change (+1 or -1)
 * @return void
 * @throws Exception
 */
function changeEventPosition(array $postData): void {
    $eventId = $postData['eventId'] ?? '';
    $month = (int)($postData['month'] ?? 0);
    $day = (int)($postData['day'] ?? 0);
    $change = (int)($postData['change'] ?? 0); // Expected: 1 (move down) or -1 (move up)

    if (empty($eventId) || empty($month) || empty($day) || empty($change)) {
        throw new Exception("Missing required parameters for position change.");
    }

    if ($change !== 1 && $change !== -1) {
        throw new Exception("Change must be exactly +1 or -1.");
    }

    $pdo = getPDO();
    $pdo->beginTransaction();

    try {
        // 1. Get current position of the target event
        $stmtCurrent = $pdo->prepare(
            "SELECT position FROM event_ordering 
             WHERE event_id = :event_id AND month = :month AND day = :day FOR UPDATE"
        );
        $stmtCurrent->execute([
            ':event_id' => $eventId,
            ':month' => $month,
            ':day' => $day
        ]);
        $currentPos = $stmtCurrent->fetchColumn();

        if ($currentPos === false) {
            throw new Exception("Event ordering not found for this date.");
        }

        $targetPos = (int)$currentPos + $change;

        if ($targetPos < 1) {
            // Already at the top, do nothing
            $pdo->commit();
            return;
        }

        // 2. Find the event currently occupying the target position
        $stmtTarget = $pdo->prepare(
            "SELECT event_id FROM event_ordering 
             WHERE month = :month AND day = :day AND position = :position FOR UPDATE"
        );
        $stmtTarget->execute([
            ':month' => $month,
            ':day' => $day,
            ':position' => $targetPos
        ]);
        $targetEventId = $stmtTarget->fetchColumn();

        if ($targetEventId === false) {
            // No event at target position (already at the bottom), do nothing
            $pdo->commit();
            return;
        }

        // 3. Perform the swap avoiding the unique constraint (month, day, position)
        $stmtUpdate = $pdo->prepare(
            "UPDATE event_ordering SET position = :new_pos 
             WHERE event_id = :event_id AND month = :month AND day = :day"
        );

        // Step A: Move the blocking event to a temporary safe position (0 is safe as positions start at 1)
        $stmtUpdate->execute([':new_pos' => 0, ':event_id' => $targetEventId, ':month' => $month, ':day' => $day]);
        
        // Step B: Move our primary event to the desired target position
        $stmtUpdate->execute([':new_pos' => $targetPos, ':event_id' => $eventId, ':month' => $month, ':day' => $day]);
        
        // Step C: Move the initially blocking event into the old position
        $stmtUpdate->execute([':new_pos' => $currentPos, ':event_id' => $targetEventId, ':month' => $month, ':day' => $day]);

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/* ---------------------------------------------------------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Core engine for merging overlaps/adjacent ranges and keeping orderings strictly synchronized.
 * 
 * 1. Fetches all ranges for an event.
 * 2. Merges overlaps and gaps <= 1 day.
 * 3. Overwrites old ranges with cleanly merged ones.
 * 4. Checks required `month-day` orderings vs existing.
 * 5. Deletes orphaned days and shifts lower events up.
 * 6. Adds missing days at the bottom of the list.
 *
 * @param string $eventId The event to reconcile.
 * @param PDO $pdo The active database connection (inside a transaction).
 * @return void
 */
function reconcileEventRangesAndOrdering(string $eventId, PDO $pdo): void {
    // 1. Fetch all current ranges for this event, sorted chronologically
    $stmtAll = $pdo->prepare(
        "SELECT range_id, start_date, end_date 
         FROM event_date_ranges 
         WHERE event_id = :event_id 
         ORDER BY start_date ASC"
    );
    $stmtAll->execute([':event_id' => $eventId]);
    $ranges = $stmtAll->fetchAll(PDO::FETCH_ASSOC);

    $coveredDays = [];

    if (!empty($ranges)) {
        $merged = [];
        $current = null;
        
        // Merge logic for overlaps and adjacent days
        foreach ($ranges as $r) {
            $start = new DateTime($r['start_date']);
            $end = new DateTime($r['end_date']);
            
            if ($current === null) {
                $current = ['start' => $start, 'end' => $end];
            } else {
                $checkStart = (clone $start)->modify('-1 day');
                if ($current['end'] >= $checkStart) {
                    if ($end > $current['end']) {
                        $current['end'] = clone $end;
                    }
                } else {
                    $merged[] = $current;
                    $current = ['start' => $start, 'end' => $end];
                }
            }
        }
        if ($current !== null) {
            $merged[] = $current;
        }

        // Wipe old unmerged ranges
        $pdo->prepare("DELETE FROM event_date_ranges WHERE event_id = :event_id")->execute([':event_id' => $eventId]);
        
        // Insert clean merged ranges
        $stmtInsertRange = $pdo->prepare(
            "INSERT INTO event_date_ranges (range_id, event_id, start_date, end_date) 
             VALUES (:range_id, :event_id, :start, :end)"
        );
        
        foreach ($merged as $m) {
            $stmtInsertRange->execute([
                ':range_id' => $pdo->query("SELECT UUID()")->fetchColumn(),
                ':event_id' => $eventId,
                ':start' => $m['start']->format('Y-m-d'),
                ':end' => $m['end']->format('Y-m-d')
            ]);
            
            // Map every single MM-DD required by this final range
            $dt = clone $m['start'];
            while ($dt <= $m['end']) {
                $month = (int)$dt->format('n');
                $day = (int)$dt->format('j');
                $coveredDays["$month-$day"] = ['month' => $month, 'day' => $day];
                $dt->add(new DateInterval('P1D'));
            }
        }
    }

    // 2. Synchronize Event Orderings
    $stmtOrderings = $pdo->prepare(
        "SELECT month, day, position 
         FROM event_ordering 
         WHERE event_id = :event_id"
    );
    $stmtOrderings->execute([':event_id' => $eventId]);
    $existing = $stmtOrderings->fetchAll(PDO::FETCH_ASSOC);

    $existingDays = [];
    $stmtDel = $pdo->prepare(
        "DELETE FROM event_ordering 
         WHERE event_id = :event_id AND month = :month AND day = :day"
    );
    $stmtShift = $pdo->prepare(
        "UPDATE event_ordering 
         SET position = position - 1 
         WHERE month = :month AND day = :day AND position > :pos"
    );

    // Delete lost days and shift
    foreach ($existing as $ord) {
        $mm_dd = $ord['month'] . '-' . $ord['day'];
        $existingDays[$mm_dd] = true;
        
        if (!isset($coveredDays[$mm_dd])) {
            $stmtDel->execute([
                ':event_id' => $eventId, 
                ':month' => $ord['month'], 
                ':day' => $ord['day']
            ]);
            
            // Close the gap so positions remain strictly sequential (1, 2, 3...)
            $stmtShift->execute([
                ':month' => $ord['month'], 
                ':day' => $ord['day'], 
                ':pos' => $ord['position']
            ]);
        }
    }

    // Insert new required days
    $stmtGetMax = $pdo->prepare(
        "SELECT COALESCE(MAX(position), 0) + 1 
         FROM event_ordering 
         WHERE month = :month AND day = :day"
    );
    $stmtInsertOrd = $pdo->prepare(
        "INSERT INTO event_ordering (ordering_id, event_id, month, day, position) 
         VALUES (:ord_id, :event_id, :month, :day, :position)"
    );
    
    foreach ($coveredDays as $mm_dd => $data) {
        if (!isset($existingDays[$mm_dd])) {
            $stmtGetMax->execute([':month' => $data['month'], ':day' => $data['day']]);
            $newPos = $stmtGetMax->fetchColumn();
            
            $stmtInsertOrd->execute([
                ':ord_id' => $pdo->query("SELECT UUID()")->fetchColumn(),
                ':event_id' => $eventId,
                ':month' => $data['month'],
                ':day' => $data['day'],
                ':position' => $newPos
            ]);
        }
    }
}

?>