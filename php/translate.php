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

    $translated_word = $dictionary[$word][$language];

    if($language == "en" || $translated_word == ""){
        return $word;
    }
   
    return $translated_word;
}

?>