/**
 * Asynchronously fetches all calendar events, date ranges, and orderings.
 * 
 * @returns {Promise<{events: Array, eventDateRanges: Array, orderings: Array, eventTypes: Array}>} 
 */
async function loadLanguageSettings() {
    let payload = {
        action: "getLanguageSettings"
    };

    try {
        // 1. Await the jQuery AJAX call and capture the response
        const response = await $.ajax({
            url: 'php/routing.php',
            type: 'POST',
            data: payload,
            dataType: 'json' // Ensures jQuery parses the JSON string into an object
        });

        // 2. Return the data so it can be destructured
        return response;

    } catch (xhr) {
        // 3. Handle errors
        console.error("Server returned an error:", xhr.status, xhr.responseText);
        
        // Return empty objects to prevent destructuring crashes on failure
        return { userLanguage: new String(), dictionary: [] };
    }
}

function buildDictionary(rows, keyField = 'en') {
    return Object.fromEntries(
        rows.map(row => {
            const { [keyField]: key, ...translations } = row;
            return [key.toLowerCase(), translations];
        })
    );
}

function firstCharUpperCase(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}