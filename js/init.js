// 1. Define an execution function
async function initializeApp() {

    let languageSettings = await loadLanguageSettings();
    userLanguage = languageSettings.userLanguage[0].user_language;
    dictionary = buildDictionary(languageSettings.dictionary);

    return new Calendar(); 
}
        
