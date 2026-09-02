<?php

require_once 'get-db-connection.php';
require_once 'event-and-date-crud.php';

// Ensure it's a POST request and an action exists
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['action'])) {
    
    $action = $_POST['action'];
    
    // Define a whitelist of allowed actions for security
    $allowedActions = ['addEvent'];

    if (in_array($action, $allowedActions) && is_callable($action)) {
        // Call the function and pass the entire $_POST array
        // This keeps your switch statement from becoming 500 lines long
        $action($_POST); 
    } else {
        http_response_code(400);
        echo "Invalid action.";
    }
}

?>