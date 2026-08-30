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