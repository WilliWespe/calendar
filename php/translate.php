<?php

/**
 * Translate an english word into the langauge defined in app.config by the user
 * Only works if the target language and the translation exist in the dictionary
 * 
 * @param string $word The english word
 * @return string The translated word
 */
function translate($word): string{

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