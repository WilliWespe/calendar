// 1. Define an execution function
async function initializeApp() {

    let languageSettings = await loadLanguageSettings();
    userLanguage = languageSettings.userLanguage[0].user_language;
    dictionary = buildDictionary(languageSettings.dictionary);

    window.document.title = firstCharUpperCase(translate("Calendar"));

    new Calendar(); 

    /*if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
		today = new Date();
		todayDate = arrMonths[today.getMonth()] + "_" + today.getDate();
		todayElement = document.getElementById(todayDate);
		todayElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
	}*/


		
}
        
