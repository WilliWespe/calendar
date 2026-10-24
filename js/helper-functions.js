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

function isNotEmpty(obj) {
  if (obj == null || obj == undefined) return false;                          // null or undefined
  if (typeof obj === "string") return obj.length > 0;     // covers ""
  if (Array.isArray(obj)) return obj.length > 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size > 0;
  return true;                                            // numbers, booleans, etc.
}

function averageHexColors(colors) {
    if (!colors || colors.length === 0) return "#000000";

    let totalR = 0, totalG = 0, totalB = 0;
    let count = colors.length;

    for (let hex of colors) {
        // Clean the string (remove '#' and whitespace)
        hex = hex.replace(/^#/, '').trim();

        // Expand short 3-digit hex (#ABC -> #AABBCC)
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        // Parse integer values for individual R, G, B channels
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Accumulate channel totals
        totalR += r;
        totalG += g;
        totalB += b;
    }

    // Calculate the floor/round average for each channel
    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);

    // Convert channels back to 2-digit hex and pad with leading zeros if necessary
    const toHex = (channel) => channel.toString(16).padStart(2, '0');

    return `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`.toUpperCase();
}