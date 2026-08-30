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
    // Explicitly decompose the post data into your required variables
    $eventData = $postData['eventData'] ?? [];
    $dateRanges = $postData['dateRanges'] ?? null;

    $pdo = getPDO();
    $isNestedTransaction = $pdo->inTransaction();
    if (!$isNestedTransaction) {
        $pdo->beginTransaction();
    }
    
    try {
        // Validate required fields inside the nested eventData array
        foreach (['description', 'type', 'color'] as $field) {
            if (empty($eventData[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $eventId = $pdo->query("SELECT UUID()")->fetchColumn();
        $includeInMail = (int)(bool)($eventData['include_in_mail'] ?? false);

        // 1. USE PREPARED STATEMENTS (No quotes needed!)
        $stmt = $pdo->prepare(
            "INSERT INTO events (event_id, description, type, color, include_in_mail)
             VALUES (:event_id, :description, :type, :color, :include_in_mail)"
        );

        // 2. EXECUTE WITH DATA
        $stmt->execute([
            ':event_id' => $eventId,
            ':description' => $eventData['description'],
            ':type' => $eventData['type'],
            ':color' => $eventData['color'],
            ':include_in_mail' => $includeInMail
        ]);

        // Add date ranges if provided
        if ($dateRanges !== null) {
            foreach ($dateRanges as $range) {
                if (!isset($range['start'])) {
                    throw new Exception("Date range must include 'start'");
                }
                $start = $range['start'];
                $end = $range['end'] ?? $start; // Single day if end not provided
                addDateToEvent($eventId, $start, $end);
            }
        }

        $pdo->commit();
        return $eventId;
    } catch (Exception $e) {
        $pdo->rollBack();
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
            if ($newEnd >= $start->modify('-1 day') && $newStart <= $end->modify('+1 day')) {
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

?>