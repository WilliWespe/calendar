class Month{

    constructor(){
        this.cells = new Map();
        this.days = new Map();
        this.id = new String();
    }

    materialize(){
        // Create new month column
        var monthColumnHTML = `
            <div class="month-column" id="`+this.getHTMLID()+`"></div>
        `;

        $("#calendar-container").append(monthColumnHTML);   
    }

    setID(id){
        this.id = id;
    }
    
    getID(){
        return this.id;
    }

    getHTMLID(){
        return 'month-'+this.id;
    }

    addCell(cell){
        this.cells.set(cell.getID(), cell);
    }

    addDay(day){
        this.days.set(day.getID(), day);
    }
}