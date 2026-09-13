<?php

// Start the session at the very top to access $_SESSION
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'get-db-connection.php';
require_once 'event-and-date-crud.php';
require_once 'crypt.php';

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Main AJAX Router for Calendar Operations.
 * 
 * This script intercepts incoming POST requests and acts as a front controller.
 * It reads the requested 'action' from the POST payload, validates it against 
 * a strict whitelist of permitted functions, and executes the target function 
 * dynamically if it exists. It handles formatting the response (JSON for arrays, 
 * plain text for strings) and catches all exceptions to return a unified 400 Bad Request
 * HTTP status code alongside the error message.
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['action'])) {

    // --- CSRF VALIDATION ---
    $clientToken = $_POST['csrf_token'] ?? '';
    $serverToken = $_SESSION['csrf_token'] ?? '';
    
    if (empty($clientToken) || !hash_equals($serverToken, $clientToken)) {
        http_response_code(403); // 403 Forbidden
        echo "CSRF token validation failed.";
        exit;
    }
    // -----------------------
    
    $action = $_POST['action'];
    
    // Define a whitelist of allowed actions for security
    $allowedActions = [
        'addEvent',
        'editEvent', 
        'deleteEvent', 
        'addDateToEvent',
        'editEventDateRange', 
        'deleteEventDateRange',
        'changeEventPosition', 
        'addEventType', 
        'getAllCalendarData'
    ];

    if (in_array($action, $allowedActions) && is_callable($action)) {
        try {
            // Execute the function
            $result = $action($_POST); 
            
            // If the function returns an array (like getAllCalendarData), output as JSON
            if (is_array($result)) {
                header('Content-Type: application/json');
                echo json_encode($result);
            } else {
                // For addEvent/addEventType, it returns a string (the UUID). Just echo it.
                echo $result;
            }
            
        // Catch 'Throwable' instead of 'Exception' to catch ALL fatal errors
        } catch (Throwable $e) { 
            // Set the HTTP response code to 400 (Bad Request) so jQuery triggers the 'catch' block
            http_response_code(400);
            
            // Output the actual error message
            echo $e->getMessage();
        }
    } else {
        http_response_code(400);
        echo "Invalid action.";
    }
}
?>