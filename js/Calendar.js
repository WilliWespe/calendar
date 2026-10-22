class Calendar extends SharedUtilities{

    constructor(){
        super();
        this.eventTypes = new Map();
        this.events = new Map();
        this.months = new Map();
        this.days = new Map();
        this.cells = new Map();

        this.raw_db_data = [];

        this.db_data_events = [];
        this.db_data_event_date_ranges = [];
        this.db_data_orderings = [];
        this.db_data_event_types = [];
        this.db_data_events_by_date = new Map();
        this.db_data_orderings_by_mm_dd = new Map();

        this.pipeline();
    }

    async pipeline(){

        await this.loadDatabaseData();

        this.createEventTypeObjects();
        this.createEventObjects();
        this.linkDateRangesToEvents();
        this.createCalendarStructure();
        this.createDayObjects();
        this.populateDaysWithEvents();
        this.applyOrderingToEventsPerDay();

        this.render();
    }

    async loadDatabaseData(){
        this.db_data = await preProcessDatabaseData();

        this.db_data_events = this.db_data[0];
        this.db_data_event_date_ranges = this.db_data[1];
        this.db_data_orderings = this.db_data[2];
        this.db_data_event_types = this.db_data[3];
        this.db_data_events_by_date = this.db_data[4];
        this.db_data_orderings_by_mm_dd = this.db_data[5];
    }

    createCalendarStructure(){
        for(var monthIndex=0; monthIndex<arrMonths.length; monthIndex++){                                                                                        // Loop through all months (0-11)

            var month = new Month();
            month.setID(monthIndex);

            this.addMonth(month);

            for(var cellNumber=0; cellNumber<32; cellNumber++){                                                                                    // Loop through all cells of a month (31 days + header)

                // Create new cell, if cellNumber == 0 (most upper cell), add month name from array

                var isHeader = (cellNumber==0);
                var cell = new Cell(isHeader);
                cell.setID(monthIndex+'-'+cellNumber);

                month.addCell(cell);
                this.addCell(cell);
            }
        }
 
        this.createDayObjects();                                                                                           // Go through all cells, and add the date and weekday
    }

    createDayObjects(){

        var daysIntoTheFuture = 0;                                                                                                                                                   

        for(var dayNumber=0; dayNumber<365; dayNumber++){                                                               // Loop through a whole year (leapyear exception see below)                                                                                                 

            var rollingDate = new Date();                                                                               
            rollingDate.setDate(rollingDate.getDate()+daysIntoTheFuture);      
            
            var rollingDateDay = rollingDate.getDate();                                                                 
            var rollingDateMonth = rollingDate.getMonth();
            var rollingDateYear = rollingDate.getFullYear(); 

            var day = new Day(rollingDate);
            var cell = this.getCell(day.getID());
        
            cell.setDay(day);     
            this.addDay(day);
            this.months.get(rollingDateMonth).addDay(day)

            if(rollingDateYear == nextYear){                                                                            // If the loop got into next year
                cell.setAdditionalInformation("nextYear", true);                                                                             // Add this class to the cell, to indicate that it's next year
            }

            if(rollingDateMonth == 1 && rollingDateDay == 29){                                                          // If there is a 29th Feb in this calendar, decrease dayNumber by one, so the loop iterates 366 times
                dayNumber--;
            }

            daysIntoTheFuture++;                                                                                             // Increase days in the future
        }
    }  
    
    createEventTypeObjects(){
        for(let eventTypeItem of this.db_data_event_types){

            let id = eventTypeItem["event_type_id"];
            let type = eventTypeItem["event_type"];
            let backgroundColor = eventTypeItem["event_type_background_color"];

            let eventTypeObject = new EventType(id, type, backgroundColor);

            this.eventTypes.set(id, eventTypeObject);
        }
    }
    
    createEventObjects(){
        for(let eventItem of this.db_data_events){

            let id = eventItem["event_id"];
            let description = eventItem["event_description"];
            let eventTypeObject = this.eventTypes.get(eventItem["event_type"]);
            let dotColor = eventItem["event_dot_color"];
            let includeEventInMail = eventItem["include_event_in_mail"];

            let eventObject = new Event(id, description, eventTypeObject, dotColor, includeEventInMail);

            this.events.set(id, eventObject);
        }
    }

    linkDateRangesToEvents(){
        for(let dateRangeItem of this.db_data_event_date_ranges){

            let id = dateRangeItem["range_id"];
            let startDate = dateRangeItem["start_date"];
            let endDate = dateRangeItem["end_date"];
            let eventObject = this.events.get(dateRangeItem["event_id"]);

            let dateRangeObject = new DateRange(id, startDate, endDate)

            eventObject.addDateRange(id, dateRangeObject);
        }
    }

    populateDaysWithEvents(){
        for(let eventObject of this.events.values()){
            let allDatesOfEvent = eventObject.getAllDates();

            for(let date of allDatesOfEvent.values()){

                let dayObject = this.days.get(this.constructDayID(date));
                if(dayObject != null){
                    dayObject.addEvent(eventObject.getID(), eventObject);
                }
            }
        }
    }

    applyOrderingToEventsPerDay(){

        for(let [MMDD, eventIDsAndPosition] of this.db_data_orderings_by_mm_dd){

            for(let [eventID, position] of Object.entries(eventIDsAndPosition)){

                let dayObject = this.getDayByMMDD(MMDD);
                if(dayObject != null){
                    dayObject.setEventPosition(eventID, position);
                }
            }
        }
    }

    render(){
        for(let dayObject of this.days.values()){
            console.log("---------------------------");
            console.log(dayObject.getID());
            for(let eventObject of dayObject.events.values()){
                console.log(eventObject.description);
            }
            console.log("---------------------------");
        }
    }
    
    addCell(cell){
        this.cells.set(cell.getID(), cell);
    }

    addDay(day){
        this.days.set(day.getID(), day);
    }

    addMonth(month){
        this.months.set(month.getID(), month);
    }

    getCell(cellID){
        return this.cells.get(cellID);
    }

    getDayByMMDD(MMDD){
        let [MM, DD] = MMDD.split('-').map(Number);
        let month = this.months.get(MM - 1);      // Month IDs are 0-based
        return month ? month.days.get(DD) : undefined;
    }
}

