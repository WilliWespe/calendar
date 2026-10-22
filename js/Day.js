class Day extends SharedUtilities{
    constructor(date){
        super();
        this.dayIndex = date.getDate();                                                                       
        this.monthIndex = date.getMonth();                                                                   
        this.year = date.getFullYear();                                                                  
        this.weekDayIndex = date.getDay()
        this.events = new Map();
        this.eventPositions = new Map();
        this.id = this.constructDayID(date);
    }

    getID(){
        return this.id;
    }

    getDayNumber(){
        return this.dayIndex;   // already exists: date.getDate()
    }

    addEvent(id, eventObject){
        this.events.set(id, eventObject);
    }

    setEventPosition(eventID, position){
        this.eventPositions.set(eventID, position);
    }
}