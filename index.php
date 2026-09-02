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
        console.log("test")
        addEvent();
	});

</script>

<body>
    <?php 
        if (file_exists(__DIR__ . '/footer.php')) {
            include __DIR__ . '/footer.php';
        }
    ?>
</body>
</html>
