class Event{

    constructor(id, description, type, dot_color, include_event_in_mail){
        this.id = id;
        this.description = description;
        this.type = type;
        this.dot_color = dot_color;
        this.include_event_in_mail = include_event_in_mail;
        this.dateRanges = new Map();
    }

    addDateRange(id, dateRangeObject){
        this.dateRanges.set(id, dateRangeObject);
    }

    getAllDates(){
        // todo
    }
}