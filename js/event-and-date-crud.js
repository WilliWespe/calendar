async function addEvent() {
    var mockupDataAddEventList = [
        {
            eventData: {
                event_description: "Das ist ein Test",
                event_type: "37940a20-ad44-11f1-834f-4c796e9137c8",
                event_dot_color: "000000",
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2026-10-01', end: '2026-10-05' }
            ]
        },
        {
            eventData: {
                event_description: "Das ist die zweite Testbeschreibung",
                event_type: "4abb804e-ad44-11f1-834f-4c796e9137c8",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-10-12', end: '2026-10-12' }
            ]
        }
    ];

    for (let i = 0; i < mockupDataAddEventList.length; i++) {
        let currentItem = mockupDataAddEventList[i];

        // 1. Create a clean JS object. 
        // jQuery will automatically convert this to bracket notation for $_POST.
        let payload = {
            action: "addEvent",
            eventData: currentItem.eventData,
            eventDateRanges: currentItem.eventDateRanges
        };

        try {
            // 2. Await the jQuery AJAX call
            await $.ajax({
                url: 'php/routing.php',
                type: 'POST',
                data: payload 
            });

            // 3. Success
            //location.reload();
            console.log("success")

        } catch (xhr) {
            // 4. Handle errors (status codes outside 200-299)
            console.error("Server returned an error:", xhr.status, xhr.responseText);
        }
    } 
}

async function deleteEvent(eventId) {
    
    // 1. Create a clean JS object. 
    // jQuery will automatically convert this to bracket notation for $_POST.
    let payload = {
        action: "deleteEvent",
        eventId: eventId
    };

    try {
        // 2. Await the jQuery AJAX call
        await $.ajax({
            url: 'php/routing.php',
            type: 'POST',
            data: payload 
        });

        // 3. Success
        //location.reload();
        console.log("success")

    } catch (xhr) {
        // 4. Handle errors (status codes outside 200-299)
        console.error("Server returned an error:", xhr.status, xhr.responseText);
    }
}

/**
 * Updates an existing event.
 * 
 * @param {string} eventId - The UUID of the event.
 * @param {string} eventDescription - The new text description.
 * @param {string} eventType - The UUID of the event_type.
 * @param {string|null} eventDotColor - Hex color (without #) or null.
 * @param {number|boolean} includeEventInMail - 1/true or 0/false.
 */
async function editEvent(eventId, eventDescription, eventType, eventDotColor = null, includeEventInMail = 1) {
    
    let payload = {
        action: "editEvent",
        eventId: eventId,
        eventData: {
            event_description: eventDescription,
            event_type: eventType,
            event_dot_color: eventDotColor,
            include_event_in_mail: includeEventInMail ? 1 : 0
        }
    };

    try {
        await $.ajax({
            url: 'php/routing.php',
            type: 'POST',
            data: payload 
        });

        console.log("Event successfully updated");
        // location.reload(); or call storeCalendarDataInRAM() to refresh UI

    } catch (xhr) {
        console.error("Server returned an error:", xhr.status, xhr.responseText);
    }
}

async function addEventType(eventType, eventBackgroundColor = null) {
    
    // 1. Create a clean JS object. 
    // jQuery will automatically convert this to bracket notation for $_POST.
    let payload = {
        action: "addEventType",
        eventType: eventType,
        eventBackgroundColor: eventBackgroundColor
    };

    try {
        // 2. Await the jQuery AJAX call
        await $.ajax({
            url: 'php/routing.php',
            type: 'POST',
            data: payload 
        });

        // 3. Success
        //location.reload();
        console.log("success")

    } catch (xhr) {
        // 4. Handle errors (status codes outside 200-299)
        console.error("Server returned an error:", xhr.status, xhr.responseText);
    }
}

/**
 * Swaps the position of an event on a specific day.
 * 
 * @param {string} eventId - The UUID of the event.
 * @param {number} month - The month (1-12).
 * @param {number} day - The day (1-31).
 * @param {number} change - Pass -1 to move up (decrease position), or 1 to move down (increase position).
 */
async function changeEventPosition(eventId, month, day, change) {
    let payload = {
        action: "changeEventPosition",
        eventId: eventId,
        month: month,
        day: day,
        change: change
    };

    try {
        await $.ajax({
            url: 'php/routing.php',
            type: 'POST',
            data: payload 
        });

        console.log("Position successfully updated");
        // You should re-render or re-fetch your calendar data here
        // await storeCalendarDataInRAM(); 

    } catch (xhr) {
        console.error("Failed to change position:", xhr.status, xhr.responseText);
    }
}

/**
 * Asynchronously fetches all calendar events, date ranges, and orderings.
 * 
 * @returns {Promise<{events: Array, dateRanges: Array, orderings: Array, eventTypes: Array}>} 
 */
async function fetchCalendarData() {
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
        return { events: [], eventDateRanges: [], orderings: [] };
    }
}

async function storeCalendarDataInRAM(){
    // After fetching all data:
    const { events, eventDateRanges, orderings, eventTypes } = await fetchCalendarData();

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
}

/*

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