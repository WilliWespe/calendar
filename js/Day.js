class Day{
    constructor(date){
        this.dayIndex = date.getDate();                                                                       
        this.monthIndex = date.getMonth();                                                                   
        this.year = date.getFullYear();                                                                  
        this.weekDayIndex = date.getDay()
    }

    getID(){
        return this.monthIndex + '-' + this.dayIndex;
    }
}