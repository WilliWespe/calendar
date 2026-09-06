<?php

require_once 'get-db-connection.php';
require_once 'event-and-date-crud.php';
require_once 'crypt.php'; 

// Ensure it's a POST request and an action exists
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['action'])) {
    
    $action = $_POST['action'];
    
    // Define a whitelist of allowed actions for security
    $allowedActions = ['addEvent', 'addEventType', 'getAllCalendarData', 'deleteEvent'];

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
            
        // 2. Catch 'Throwable' instead of 'Exception' to catch ALL fatal errors
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