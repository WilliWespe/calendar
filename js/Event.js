class Event{

    constructor(id, description, type, dot_color, include_event_in_mail){
        this.id = id;
        this.description = description;
        this.type = type;
        this.dot_color = dot_color;
        this.include_event_in_mail = include_event_in_mail;
        this.dateRanges = new Map();
    }

    getID(){
        return this.id;
    }

    addDateRange(id, dateRangeObject){
        this.dateRanges.set(id, dateRangeObject);
    }

    getAllDates(){
        let allDates = new Set();
        for (let [dateRangeID, dateRangeObject] of this.dateRanges) {

            let startDate = dateRangeObject.getStartDate();
            let endDate = dateRangeObject.getEndDate();

            // todo for loop between both dates

            allDates.add(startDate);
            allDates.add(endDate);


        }

        return allDates;
    }
}