<?php

function translate($word){

    $config = getConfig();
    $language = $config['user']['language'];

    $dictionary = [
        "calendar" => [
            "de" => "Kalender"
        ],
    ];

    if($language == "en"){
        return $word;
    }
   
    return $dictionary[$word][$language];
}

?>