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

        let indicatorColors = this.getIndicatorColors();

        let allBackgroundColors = Array.from(indicatorColors[0]);
        let allLineColors = Array.from(indicatorColors[1]);
        let allDotColors = Array.from(indicatorColors[2]);

        if(allBackgroundColors.length == 1){
            allBackgroundColors.push(defaultBackgroundColor);
        }

        let indicatorBox = $("#"+this.getHTMLID()+"-event-indicator-box");                                                                        // How many colors are in the gradient
        
        if(allBackgroundColors.length > 1){
            let gradient = "linear-gradient(to top left";                                                               // Initialise gradient
            for(var backgroundColorIndex = 0; backgroundColorIndex < allBackgroundColors.length; backgroundColorIndex++){
                gradient += ",#"+allBackgroundColors[backgroundColorIndex];
            }
            gradient += ")";
            $("#"+this.getHTMLID()).css("background", gradient);
        }   
    
        if(allLineColors.length > 0){                         
            indicatorBox.css("border-right", "solid "+averageHexColors(allLineColors)+" 5px");                      
        }
        if(allDotColors.length > 0){      
            let averageDotColor = averageHexColors(allDotColors);                                                            
            indicatorBox.html("&#9679;");
            indicatorBox.css("color", averageDotColor)
        }
    }

    getIndicatorColors(){

        let allBackgroundColors = new Set();
        let allLineColors = new Set();
        let allDotColors = new Set();

        if(isNotEmpty(this.day)){

            if(this.day.isWeekEnd()){
                allBackgroundColors.add(fallBackFreeBackgroundColor);
            }

            let eventObjects = this.day.getEvents();

            if(isNotEmpty(eventObjects)){
                for(let eventItem of eventObjects.values()){

                    let eventTypeObject = eventItem.getType();
                    let backgroundColor = eventTypeObject.getBackgroundColor();

                    let dotColor = eventItem.getDotColor();

                    if(isNotEmpty(backgroundColor)){
                        allBackgroundColors.add(backgroundColor);
                    }
                    else if(isNotEmpty(dotColor)){
                        let isCurrentEventMultiDay = eventItem.getMultiDateRangesForDay(this.day).length > 0;

                        console.log(isCurrentEventMultiDay);

                        if(isCurrentEventMultiDay){
                            allLineColors.add(dotColor);
                        }
                        else{
                            allDotColors.add(dotColor);
                        }
                    }
                }
            }
        }

        return [allBackgroundColors, allLineColors, allDotColors];
    }

    getHTMLContent(){
        if(this.getAdditionalInformation("month-cell")){
            let monthName = arrMonths[this.month.getID()];
            return firstCharUpperCase(translate(monthName));
        }
        else if(isNotEmpty(this.day)){

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