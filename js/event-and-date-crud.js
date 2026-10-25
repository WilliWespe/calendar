// Automatically append the CSRF token to all jQuery AJAX POST requests
$.ajaxSetup({
    beforeSend: function(jqXHR, settings) {
        if (settings.type.toUpperCase() === 'POST') {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            
            // Append token whether data is a string or an object
            if (typeof settings.data === 'string') {
                settings.data += '&csrf_token=' + encodeURIComponent(csrfToken);
            } else if (typeof settings.data === 'object') {
                settings.data.csrf_token = csrfToken;
            }
        }
    }
});

/**
 * Sends an AJAX POST to routing.php. Reloads the page on success.
 * Set reload: false if you make several calls in a row and want to
 * reload once at the end yourself.
 */
async function apiRequest(payload, reload = true) {
    let success = true;
    try {
        await $.ajax({
            url: 'php/routing.php',
            type: 'POST',
            data: payload
        });
    } catch (xhr) {
        console.error("Server returned an error:", xhr.status, xhr.responseText);
        success = false;
    }

    if (reload && success) {
        location.reload();
    }
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Creates new events using hardcoded mockup data and sends them to the server.
 * Iterates through a predefined list of events and date ranges, sending an AJAX POST request for each.
 * 
 * @returns {Promise<void>}
 */
async function addEvent() {

    var event_type_stuff = "a19d7430-c8c2-11f1-bf3b-4c796e9137c8";
    var event_type_birthday = "9a1fb941-c8c2-11f1-bf3b-4c796e9137c8";
    var event_type_free = "b13a1901-c8c2-11f1-bf3b-4c796e9137c8";

    var mockupDataAddEventList = [
        {
            eventData: {
                event_description: "Das ist ein Test",
                event_type: event_type_stuff,
                event_dot_color: "0de",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-01-01', end: '2028-01-01' }
            ]
        }
    ];

    for (let i = 0; i < mockupDataAddEventList.length; i++) {
        let currentItem = mockupDataAddEventList[i];
        await apiRequest({
            action: "addEvent",
            eventData: currentItem.eventData,
            eventDateRanges: currentItem.eventDateRanges
        }, reload=false);
    }
    location.reload();
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Deletes an event and all its associated data from the database.
 * 
 * @param {string} eventId - The UUID of the event to delete.
 * @returns {Promise<void>}
 */
async function deleteEvent(eventId) {
    await apiRequest({
        action: "deleteEvent",
        eventId: eventId
    });
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Updates an existing event.
 * 
 * @param {string} eventId - The UUID of the event.
 * @param {string} eventDescription - The new text description.
 * @param {string} eventType - The UUID of the event_type.
 * @param {string|null} eventDotColor - Hex color (without #) or null.
 * @param {number|boolean} includeEventInMail - 1/true or 0/false.
 * @returns {Promise<void>}
 */
async function editEvent(eventId, eventDescription, eventType, eventDotColor = null, includeEventInMail = 1) {

    await apiRequest({
        action: "editEvent",
        eventId: eventId,
        eventData: {
            event_description: eventDescription,
            event_type: eventType,
            event_dot_color: eventDotColor,
            include_event_in_mail: includeEventInMail ? 1 : 0
        }
    });
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Adds a new date range to an existing event and triggers server-side reconciliation.
 * 
 * @param {string} eventId - The UUID of the existing event.
 * @param {string} startDate - The start date (YYYY-MM-DD format).
 * @param {string|null} [endDate=null] - The end date (YYYY-MM-DD format). Leave null for a single day.
 * @returns {Promise<void>}
 */
async function addDateRangeToEvent(eventId, startDate, endDate = null) {
    await apiRequest({
        action: "addDateToEvent", // Maps to the existing PHP function name
        eventId: eventId,
        startDate: startDate,
        endDate: endDate
    });
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Edits an existing date range for an event and triggers server-side reconciliation.
 * 
 * @param {string} rangeId - The UUID of the specific date range to modify.
 * @param {string} eventId - The UUID of the parent event.
 * @param {string} startDate - The new start date (YYYY-MM-DD format).
 * @param {string} endDate - The new end date (YYYY-MM-DD format).
 * @returns {Promise<void>}
 */
async function editEventDateRange(rangeId, eventId, startDate, endDate) {
    await apiRequest({
        action: "editEventDateRange",
        rangeId: rangeId,
        eventId: eventId,
        startDate: startDate,
        endDate: endDate
    });
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Deletes a specific date range from an event and cleans up orphaned orderings.
 * 
 * @param {string} rangeId - The UUID of the date range to delete.
 * @param {string} eventId - The UUID of the parent event.
 * @returns {Promise<void>}
 */
async function deleteEventDateRange(rangeId, eventId) {
    await apiRequest({
        action: "deleteEventDateRange",
        rangeId: rangeId,
        eventId: eventId
    });
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Adds a new event type to the database, optionally with a background color.
 * 
 * @param {string} eventType - The name of the new event type.
 * @param {string|null} [eventBackgroundColor=null] - The hex color code (without #) for the background, or null.
 * @returns {Promise<void>}
 */
async function addEventType(eventType, eventBackgroundColor = null) {
    await apiRequest({
        action: "addEventType",
        eventType: eventType,
        eventBackgroundColor: eventBackgroundColor
    });
    
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Swaps the position of an event on a specific day.
 * 
 * @param {string} eventId - The UUID of the event.
 * @param {number} month - The month (1-12).
 * @param {number} day - The day (1-31).
 * @param {number} change - Pass -1 to move up (decrease position), or 1 to move down (increase position).
 * @returns {Promise<void>}
 */
async function changeEventPosition(eventId, month, day, change) {
    await apiRequest({
        action: "changeEventPosition",
        eventId: eventId,
        month: month,
        day: day,
        change: change
    }, reload = false);
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Asynchronously fetches all calendar events, date ranges, and orderings.
 * 
 * @returns {Promise<{events: Array, eventDateRanges: Array, orderings: Array, eventTypes: Array}>} 
 */
async function fetchDataFromDatabase() {
    let payload = {
        action: "getAllCalendarData"
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
        
        // Return empty arrays to prevent destructuring crashes on failure
        return { events: [], eventDateRanges: [], orderings: [], eventTypes: [] };
    }
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Fetches calendar data and processes it into Maps for O(1) lookups in the UI.
 * Logs out the processed structures for verification.
 * 
 * @returns {Promise<void>}
 */
async function preProcessDatabaseData(){
    // After fetching all data:
    const { events, eventDateRanges, orderings, eventTypes } = await fetchDataFromDatabase();

    // Pre-process for O(1) lookups:
    const eventsByDate = new Map();  // date (YYYY-MM-DD) → events[]
    const orderingsByMM_DD = new Map(); // "MM-DD" → { event_id: position }

    // Build eventsByDate
    eventDateRanges.forEach(range => {
        const start = new Date(range.start_date);
        const end = new Date(range.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (!eventsByDate.has(dateStr)) {
                eventsByDate.set(dateStr, []);
            }
            eventsByDate.get(dateStr).push(events.find(e => e.event_id === range.event_id));
        }
    });

    // Build orderingsByMM_DD
    orderings.forEach(o => {
        const mm_dd = `${String(o.month).padStart(2, '0')}-${String(o.day).padStart(2, '0')}`;
        if (!orderingsByMM_DD.has(mm_dd)) {
            orderingsByMM_DD.set(mm_dd, {});
        }
        orderingsByMM_DD.get(mm_dd)[o.event_id] = o.position;
    });

    console.log("----------------------------------------------")
    console.log("Events:")
    console.log(events);
    console.log("----------------------------------------------")
    console.log("Date ranges:")
    console.log(eventDateRanges);
    console.log("----------------------------------------------")
    console.log("orderings:")
    console.log(orderings);
    console.log("----------------------------------------------")
    console.log("Event Types:")
    console.log(eventTypes);
    console.log("----------------------------------------------")
    console.log("Events by Date:")
    console.log(eventsByDate);
    console.log("----------------------------------------------")
    console.log("Orderings by MM_DD:")
    console.log(orderingsByMM_DD);
    console.log("----------------------------------------------")

    return [events, eventDateRanges, orderings, eventTypes, eventsByDate, orderingsByMM_DD];
}

/*
/**
 * Resolves clicked cell events, sorts them based on ordering, and triggers UI rendering.
 * 
 * @param {string|Date} date - The date of the cell clicked, formatted appropriately.
 * @returns {void}
 *\/
// On cell click (instant, no network request):
function onCellClick(date) {
    const events = eventsByDate.get(date) || [];
    const mm_dd = `${String(new Date(date).getMonth() + 1).padStart(2, '0')}-${String(new Date(date).getDate()).padStart(2, '0')}`;
    const ordering = orderingsByMM_DD.get(mm_dd) || {};

    // Sort events by position
    events.sort((a, b) => (ordering[a.event_id] || 0) - (ordering[b.event_id] || 0));

    renderEvents(events);
}
*/