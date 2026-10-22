class Day extends SharedUtilities{
    constructor(date){
        this.dayIndex = date.getDate();                                                                       
        this.monthIndex = date.getMonth();                                                                   
        this.year = date.getFullYear();                                                                  
        this.weekDayIndex = date.getDay()
        this.events = new Map();
        this.id = SharedUtilities.constructDayID(date);
    }

    getID(){
        return this.id;
    }

    addEvent(id, eventObject){
        this.events.set(id, eventObject);
    }
}