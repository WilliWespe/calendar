<?php

require_once __DIR__ . '/php/helper-functions.php';
require_once __DIR__ . '/php/translate.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<meta name="viewport" content="width=device-width, initial-scale=1">-->
    <meta name="description" content="">
    <meta name="author" content="">
    <meta name="csrf-token" content="<?php echo htmlspecialchars(getCsrfToken()); ?>">
    
    <title><?php echo ucfirst(translate('calendar')) ?></title>	

    <link id="icon" rel="shortcut icon" type="image/x-icon" href="../favicon.ico"/>
	
    <link href="css/style.css" rel="stylesheet">
    <link href="googleFonts/fonts.css" rel="stylesheet">
    <script src="js/jquery.js"></script>
    <script src="js/event-and-date-crud.js"></script>
</head>

<script>

	$(document).ready(function(){
	});

</script>

<body>
    <button onclick="addEvent()">Add event</button>
    <button onclick="storeCalendarDataInRAM()">Fetch Data</button>
    <button onclick="addEventType('birthday', 'ffcc02')">Add event type</button>
    <button onclick="deleteEvent('216a40d5-af7a-11f1-b3a4-4c796e9137c8')">Delete event</button>
    <button onclick="editEvent('2175253f-af7a-11f1-b3a4-4c796e9137c8', 'Test', '37940a20-ad44-11f1-834f-4c796e9137c8', eventDotColor = 'ffffff', includeEventInMail = 0)">Edit Event</button>
    <button onclick="changeEventPosition('9528971e-af7a-11f1-b3a4-4c796e9137c8', 10, 12, -1)">Change order</button>
    <button onclick="addDateRangeToEvent('951f61d3-af7a-11f1-b3a4-4c796e9137c8', '2026-10-03', '2026-10-13')">Add Date Range to Existing Event</button>
    <button onclick="editEventDateRange('952adbda-af7a-11f1-b3a4-4c796e9137c8', '9528971e-af7a-11f1-b3a4-4c796e9137c8', '2026-10-07', '2026-10-07')">Edit Range</button>
    <button onclick="deleteEventDateRange('b278fb20-af7d-11f1-b3a4-4c796e9137c8', '9528971e-af7a-11f1-b3a4-4c796e9137c8')">Delete Range</button>

    <?php
        // Display custom footer elements 
        if (file_exists(__DIR__ . '/footer.php')) {
            include __DIR__ . '/footer.php';
        }
    ?>
</body>
</html>
