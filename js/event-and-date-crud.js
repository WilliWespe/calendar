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
                event_description: "Mockup Beach Holiday Viktor",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-04-07', end: '2028-04-24' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Trip Liam",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-08-05', end: '2029-08-24' },
                { start: '2029-12-08', end: '2029-12-28' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Photo Shoot Chloe",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-07-03', end: '2029-07-08' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Neighborhood Cleanup Ursula",
                event_type: event_type_stuff,
                event_dot_color: "ffbb88",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-08-08', end: '2028-08-16' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Movie Night Quirin",
                event_type: event_type_stuff,
                event_dot_color: "7e2472",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-02-18', end: '2027-02-18' },
                { start: '2028-11-19', end: '2028-11-19' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Wellness Retreat Lena",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-08-05', end: '2026-08-05' },
                { start: '2029-04-20', end: '2029-05-09' },
                { start: '2029-12-18', end: '2029-12-19' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Dentist Theo",
                event_type: event_type_stuff,
                event_dot_color: "3bb319",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-11-10', end: '2027-11-10' },
                { start: '2027-03-31', end: '2027-03-31' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Ursula",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-08-29', end: '2026-08-29' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Jonas",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-12-23', end: '2028-01-01' },
                { start: '2027-11-01', end: '2027-11-01' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Language Class Finn",
                event_type: event_type_stuff,
                event_dot_color: "407c9c",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-03-29', end: '2026-03-29' },
                { start: '2027-09-21', end: '2027-09-25' },
                { start: '2027-12-09', end: '2027-12-09' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Trade Fair Rosa",
                event_type: event_type_stuff,
                event_dot_color: "8a890e",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-04-07', end: '2027-04-07' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Gym Quirin",
                event_type: event_type_stuff,
                event_dot_color: "ad8a22",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-06-18', end: '2026-06-18' },
                { start: '2028-09-02', end: '2028-09-02' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Barbecue Simon",
                event_type: event_type_stuff,
                event_dot_color: "b74b4b",
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2026-06-08', end: '2026-06-08' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Team Meeting Chloe",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-04-08', end: '2026-04-08' },
                { start: '2026-12-05', end: '2026-12-05' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Xenia",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-11-08', end: '2027-11-08' },
                { start: '2028-11-22', end: '2028-11-22' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Beach Holiday Mia",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-01-13', end: '2028-01-13' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Open Mic Anna",
                event_type: event_type_stuff,
                event_dot_color: "1010c9",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-07-22', end: '2026-07-22' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Camping Emma",
                event_type: event_type_free,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2029-06-01', end: '2029-06-01' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Conference Theo",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-12-02', end: '2027-12-03' },
                { start: '2027-09-17', end: '2027-09-26' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Ivan",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-07-19', end: '2026-07-20' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Mia",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-11-16', end: '2029-11-16' },
                { start: '2029-04-23', end: '2029-04-23' },
                { start: '2026-06-30', end: '2026-06-30' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup City Break Rosa",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-05-10', end: '2029-05-13' },
                { start: '2028-10-20', end: '2028-10-29' },
                { start: '2027-03-16', end: '2027-03-16' },
                { start: '2027-06-27', end: '2027-06-27' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Book Club Yannick",
                event_type: event_type_stuff,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2029-01-28', end: '2029-01-28' },
                { start: '2029-02-22', end: '2029-02-24' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Trade Fair Oscar",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-10-22', end: '2027-10-22' },
                { start: '2026-07-15', end: '2026-07-15' },
                { start: '2029-02-20', end: '2029-02-20' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Family Visit Chloe",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-11-27', end: '2026-11-27' },
                { start: '2029-12-14', end: '2029-12-14' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Road Trip Greta",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-07-29', end: '2029-08-02' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Ski Week Xenia",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-08-18', end: '2027-08-21' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Sprint Review Lena",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-06-11', end: '2029-06-11' },
                { start: '2029-01-17', end: '2029-01-17' },
                { start: '2029-07-16', end: '2029-07-16' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Hackathon Chloe",
                event_type: event_type_stuff,
                event_dot_color: "d3ab8c",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-01-05', end: '2027-01-05' },
                { start: '2026-06-05', end: '2026-06-05' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Repair Appointment Yannick",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-09-20', end: '2029-09-20' },
                { start: '2027-05-24', end: '2027-05-24' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Gym Hannah",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-09-14', end: '2029-09-14' },
                { start: '2028-12-24', end: '2029-01-02' },
                { start: '2029-03-17', end: '2029-03-17' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Yoga Class Viktor",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-12-05', end: '2029-12-05' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Open Mic Max",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-03-23', end: '2029-03-23' },
                { start: '2026-04-11', end: '2026-04-11' },
                { start: '2028-08-21', end: '2028-08-21' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Klara",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-03-12', end: '2026-03-17' },
                { start: '2029-06-14', end: '2029-06-14' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Weekend Getaway Theo",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-11-26', end: '2027-11-26' },
                { start: '2029-11-05', end: '2029-11-25' },
                { start: '2029-11-12', end: '2029-11-15' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Quirin",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-08-16', end: '2029-08-16' },
                { start: '2029-01-11', end: '2029-01-11' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Camping Elena",
                event_type: event_type_free,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2029-12-21', end: '2029-12-21' },
                { start: '2028-02-21', end: '2028-02-21' },
                { start: '2028-05-21', end: '2028-06-05' },
                { start: '2028-11-05', end: '2028-11-11' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Doctor Visit Chloe",
                event_type: event_type_stuff,
                event_dot_color: "f6124c",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-11-25', end: '2028-11-25' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Car Service Quirin",
                event_type: event_type_stuff,
                event_dot_color: "6678b2",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-06-25', end: '2029-06-25' },
                { start: '2028-01-19', end: '2028-01-19' },
                { start: '2027-10-14', end: '2027-10-14' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Board Game Night Xenia",
                event_type: event_type_stuff,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2028-01-02', end: '2028-01-06' },
                { start: '2026-02-13', end: '2026-02-13' },
                { start: '2027-03-26', end: '2027-03-26' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Swimming Simon",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-07-10', end: '2027-07-10' },
                { start: '2029-07-03', end: '2029-07-08' },
                { start: '2028-10-24', end: '2028-11-02' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Repair Appointment Jonas",
                event_type: event_type_stuff,
                event_dot_color: "9fc0ad",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-04-29', end: '2026-04-29' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Board Game Night Jonas",
                event_type: event_type_stuff,
                event_dot_color: "4250e8",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-03-20', end: '2026-03-20' },
                { start: '2027-10-27', end: '2027-10-27' },
                { start: '2028-06-16', end: '2028-06-21' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Project Deadline Ivan",
                event_type: event_type_stuff,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2026-07-16', end: '2026-07-16' },
                { start: '2029-09-13', end: '2029-09-19' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Soccer Training Viktor",
                event_type: event_type_stuff,
                event_dot_color: "72ddaf",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-11-01', end: '2026-11-01' },
                { start: '2028-05-22', end: '2028-05-22' },
                { start: '2027-02-28', end: '2027-03-02' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Max",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-03-12', end: '2029-03-15' },
                { start: '2028-08-17', end: '2028-08-20' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Dentist Zoe",
                event_type: event_type_stuff,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2028-09-23', end: '2028-10-01' },
                { start: '2027-10-27', end: '2027-10-27' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Book Club Ben",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-02-28', end: '2029-02-28' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Language Class Ben",
                event_type: event_type_stuff,
                event_dot_color: "ed1cd7",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-11-24', end: '2027-11-24' },
                { start: '2026-07-11', end: '2026-07-11' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Ski Week Elena",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-02-16', end: '2028-02-16' },
                { start: '2026-06-28', end: '2026-07-02' },
                { start: '2028-06-09', end: '2028-06-16' },
                { start: '2028-05-12', end: '2028-05-29' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Doctor Visit David",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-06-23', end: '2028-07-02' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Book Club Chloe",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-12-09', end: '2026-12-09' },
                { start: '2028-06-16', end: '2028-06-16' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Sprint Review Yannick",
                event_type: event_type_stuff,
                event_dot_color: "96430e",
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2029-03-30', end: '2029-03-30' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Soccer Training Quirin",
                event_type: event_type_stuff,
                event_dot_color: "a6dd8b",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-02-15', end: '2029-02-15' },
                { start: '2027-04-23', end: '2027-04-24' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Job Interview Ben",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-12-11', end: '2029-12-11' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Neighborhood Cleanup Ben",
                event_type: event_type_stuff,
                event_dot_color: "75b809",
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2028-07-04', end: '2028-07-04' },
                { start: '2026-05-30', end: '2026-05-30' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Yannick",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-02-14', end: '2028-02-14' },
                { start: '2029-08-13', end: '2029-08-18' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Open Mic Liam",
                event_type: event_type_stuff,
                event_dot_color: "ef935f",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-01-02', end: '2029-01-02' },
                { start: '2026-02-03', end: '2026-02-06' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Photo Shoot Pia",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-03-26', end: '2029-03-26' },
                { start: '2026-05-23', end: '2026-05-23' },
                { start: '2028-01-05', end: '2028-01-05' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Photo Shoot Finn",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-12-10', end: '2029-12-10' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Greta",
                event_type: event_type_birthday,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2028-08-26', end: '2028-08-31' },
                { start: '2027-03-25', end: '2027-03-25' },
                { start: '2029-01-12', end: '2029-01-15' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Conference Hannah",
                event_type: event_type_stuff,
                event_dot_color: "7bd578",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-05-10', end: '2028-05-16' },
                { start: '2026-07-16', end: '2026-07-16' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Car Service Mia",
                event_type: event_type_stuff,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2028-02-21', end: '2028-02-23' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Barbecue Xenia",
                event_type: event_type_stuff,
                event_dot_color: "6fe731",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-02-09', end: '2026-02-09' },
                { start: '2028-08-21', end: '2028-08-28' },
                { start: '2029-02-19', end: '2029-02-19' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Movie Night Anna",
                event_type: event_type_stuff,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2029-03-03', end: '2029-03-03' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Concert Theo",
                event_type: event_type_stuff,
                event_dot_color: "efb8b7",
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-11-07', end: '2029-11-07' },
                { start: '2027-02-15', end: '2027-02-16' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Theo",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2029-11-11', end: '2029-11-11' },
                { start: '2028-11-26', end: '2028-11-26' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Language Class Ivan",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-05-23', end: '2028-05-23' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Wellness Retreat Emma",
                event_type: event_type_free,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-10-19', end: '2028-11-08' },
                { start: '2027-06-24', end: '2027-07-13' },
                { start: '2026-06-17', end: '2026-06-17' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Doctor Visit Ursula",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2026-04-10', end: '2026-04-18' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Sprint Review Theo",
                event_type: event_type_stuff,
                event_dot_color: "5bf378",
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2027-11-21', end: '2027-11-21' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Soccer Training Ursula",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2027-01-10', end: '2027-01-10' },
                { start: '2028-08-11', end: '2028-08-11' },
                { start: '2028-10-11', end: '2028-10-11' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Gym Greta",
                event_type: event_type_stuff,
                include_event_in_mail: 0
            },
            eventDateRanges: [
                { start: '2029-06-21', end: '2029-06-29' },
                { start: '2026-05-19', end: '2026-05-19' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Birthday Lena",
                event_type: event_type_birthday,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-08-25', end: '2028-08-25' }
            ]
        },
        {
            eventData: {
                event_description: "Mockup Trade Fair Anna",
                event_type: event_type_stuff,
                include_event_in_mail: 1
            },
            eventDateRanges: [
                { start: '2028-01-15', end: '2028-01-19' },
                { start: '2028-08-26', end: '2028-09-03' }
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

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Deletes an event and all its associated data from the database.
 * 
 * @param {string} eventId - The UUID of the event to delete.
 * @returns {Promise<void>}
 */
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
    let payload = {
        action: "addDateToEvent", // Maps to the existing PHP function name
        eventId: eventId,
        startDate: startDate,
        endDate: endDate
    };

    try {
        await $.ajax({ 
            url: 'php/routing.php', 
            type: 'POST', 
            data: payload 
        });
        console.log("Date range successfully added and reconciled.");
    } catch (xhr) {
        console.error("Failed to add date range:", xhr.status, xhr.responseText);
    }
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
    let payload = {
        action: "editEventDateRange",
        rangeId: rangeId,
        eventId: eventId,
        startDate: startDate,
        endDate: endDate
    };

    try {
        await $.ajax({ 
            url: 'php/routing.php', 
            type: 'POST', 
            data: payload 
        });
        console.log("Date range successfully edited and reconciled.");
    } catch (xhr) {
        console.error("Failed to edit date range:", xhr.status, xhr.responseText);
    }
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
    let payload = {
        action: "deleteEventDateRange",
        rangeId: rangeId,
        eventId: eventId
    };

    try {
        await $.ajax({ 
            url: 'php/routing.php', 
            type: 'POST', 
            data: payload 
        });
        console.log("Date range successfully deleted and orderings cleaned.");
    } catch (xhr) {
        console.error("Failed to delete date range:", xhr.status, xhr.responseText);
    }
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

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Asynchronously fetches all calendar events, date ranges, and orderings.
 * 
 * @returns {Promise<{events: Array, eventDateRanges: Array, orderings: Array, eventTypes: Array}>} 
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

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Fetches calendar data and processes it into Maps for O(1) lookups in the UI.
 * Logs out the processed structures for verification.
 * 
 * @returns {Promise<void>}
 */
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