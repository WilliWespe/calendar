async function addEvent() {
    var mockupDataAddEventList = [
        {
            eventData: {
                description: "Das ist die erste Testbeschreibung",
                type: "sonstiges",
                color: "#ff0000",
                include_in_mail: 0
            },
            dateRanges: [
                { start: '2026-10-01', end: '2026-10-05' }
            ]
        },
        {
            eventData: {
                description: "Das ist die zweite Testbeschreibung",
                type: "frei",
                color: "#ffcc02",
                include_in_mail: 1
            },
            dateRanges: [
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
            dateRanges: currentItem.dateRanges
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

/*
// After fetching all data:
const { events, dateRanges, orderings } = await fetchCalendarData();

// Pre-process for O(1) lookups:
const eventsByDate = new Map();  // date (YYYY-MM-DD) → events[]
const orderingsByMM_DD = new Map(); // "MM-DD" → { event_id: position }

// Build eventsByDate
dateRanges.forEach(range => {
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