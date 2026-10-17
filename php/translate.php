<?php

/**
 * Translate an english text into the language defined in app.config by the user
 * Only works if the target language and the translation exist in the dictionary
 * 
 * @param string $text The english text
 * @return string The translated text
 */
function translate($text): string{

    $config = getConfig();
    $language = $config['user']['language'];

    $dictionary = [
        "calendar" => [
            "de" => "Kalender"
        ],
        "stuff" => [
            "de" => "sonstiges"
        ],
        "free" => [
            "de" => "frei"
        ],
        "birthday" => [
            "de" => "Geburtstag"
        ],
    ];

    $translated_text = $dictionary[$text][$language];

    if($language == "en" || $translated_text == ""){
        return $text;
    }
   
    return $translated_text;
}

?>