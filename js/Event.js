class Event{

    constructor(id, description, type, dot_color, include_event_in_mail){
        this.id = id;
        this.description = description;
        this.type = type;
        this.dotColor = dot_color;
        this.include_event_in_mail = include_event_in_mail;
        this.dateRanges = new Map();
    }

    getID(){
        return this.id;
    }

    getType(){
        return this.type;
    }

    getDotColor(){
        return this.dotColor;
    }

    addDateRange(id, dateRangeObject){
        this.dateRanges.set(id, dateRangeObject);
    }

    getAllDateRanges(){
        return this.dateRanges;
    }

    getAllDates(){
        let allDates = new Set();
        for (let [dateRangeID, dateRangeObject] of this.dateRanges) {

            let startDate = dateRangeObject.getStartDate();
            let endDate = dateRangeObject.getEndDate();
            
            let dt = new Date(startDate);
            while (dt <= endDate) {
                allDates.add(new Date(dt));
                dt.setDate(dt.getDate() + 1);
            }
        }

        return allDates;
    }

    /**
    * Returns all date ranges of the event that contain a date whose
    * month (MM) and day (DD) match the specific day, excluding ranges
    * whose start and end dates are identical.
    *
    * @param {Date} day - the reference day (only month + date are compared)
    * @returns {DateRange[]} matching, non-single-day date ranges
    */
    getMultiDateRangesForDay(day){
        const targetMonth = day.getMonthIndex();
        const targetDay = day.getDayNumber();

        const matchingRanges = [];

        for (let [dateRangeID, dateRangeObject] of this.dateRanges) {
            const startDate = dateRangeObject.getStartDate();
            const endDate = dateRangeObject.getEndDate();

            // Filter: keep only ranges whose start and end dates are NOT identical
            const sameDay =
                startDate.getFullYear() === endDate.getFullYear() &&
                startDate.getMonth() === endDate.getMonth() &&
                startDate.getDate() === endDate.getDate();
            if (sameDay) {
                continue;
            }

            // Check if the range includes a date with the target MM/DD
            let containsMatchingDate = false;
            let dt = new Date(startDate);
            while (dt <= endDate) {
                if (dt.getMonth() === targetMonth && dt.getDate() === targetDay) {
                    containsMatchingDate = true;
                    break;
                }
                dt.setDate(dt.getDate() + 1);
            }

            if (containsMatchingDate) {
                matchingRanges.push(dateRangeObject);
            }
        }

        return matchingRanges;
    }
}