class Cell {

    constructor(){
        
        this.day = null;
        this.month = new Month();
        this.id = new String();
        this.additionalInformation = new Map();
    }

    materialize(){

        let monthColumnHTMLID = this.month.getHTMLID();
        let cellHTMContent = this.getHTMLContent();
        let cellHTML = `
            <div id="`+this.getHTMLID()+`">`+cellHTMContent+`</div>
        `;
        
        $("#"+monthColumnHTMLID).append(cellHTML);

        this.applyStyling();
    }

    applyStyling(){

        $("#"+this.getHTMLID()).removeClass();

        let cssClassesToApply = ['cell'];

        for(let [infoKey, infoValue] of this.additionalInformation){
            if(infoValue){
                cssClassesToApply.push(infoKey);
            }
        }

        $("#"+this.getHTMLID()).addClass(cssClassesToApply);

    }

    getHTMLContent(){
        if(this.getAdditionalInformation("month-cell")){
            let monthName = arrMonths[this.month.getID()];
            return firstCharUpperCase(translate(monthName));
        }
        else if(this.day != null){

            let weekDayIndex = this.day.getWeekDayIndex();
            let weekDayString = arrWeekDays[weekDayIndex];

            let dayNumber = this.day.getDayNumber();

            return `
                <div id="`+this.getHTMLID()+`-date">`+firstCharUpperCase(weekDayString.slice(0,2)) + " " + dayNumber+`</div>
                <div id="`+this.getHTMLID()+`-event-indicator-box"></div>
            `;
        }
        else{
            return "";
        }
    }

    setID(id){
        this.id = id;
    }

    getID(){
        return this.id;
    }

    getHTMLID(){
        return 'cell-'+this.id;
    }

    setAdditionalInformation(key, value){
        this.additionalInformation.set(key, value);
    }

    getAdditionalInformation(key){
        return this.additionalInformation.get(key);
    }

    setDay(day){
        this.day = day;
    }

    setMonth(month){
        this.month = month;
    }
}