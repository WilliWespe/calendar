/**
 * Translate an English text into the language defined in app.config
 * @param {string} text - The English text
 * @returns {string} The translated text
 */
function translate(text) {

    // Look up translation safely using optional chaining (?.)
    const translatedText = dictionary[text.toLowerCase()]?.[userLanguage];

    // Return original text if language is English or if translation isn't found
    if (userLanguage === "en" || !translatedText) {
        return text;
    }

    return translatedText;
}