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
    <button onclick="deleteEvent('6f70fa2e-ad45-11f1-834f-4c796e9137c8')">Delete event</button>
    <button onclick="editEvent('8951bc98-ad47-11f1-834f-4c796e9137c8', 'Niklas Lochmann', '4abb804e-ad44-11f1-834f-4c796e9137c8', eventDotColor = null, includeEventInMail = 1)">Edit Event</button>
    <button onclick="changeEventPosition('895cbbff-ad47-11f1-834f-4c796e9137c8', 10, 12, 1)">Change order</button>
    <?php 
        if (file_exists(__DIR__ . '/footer.php')) {
            include __DIR__ . '/footer.php';
        }
    ?>
</body>
</html>
