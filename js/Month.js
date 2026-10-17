class Month{

    constructor(){
        this.cells = new Map();
        this.days = new Map();
        this.id = new String();
    }

    setID(id){
        this.id = id;
    }
    
    getID(){
        return this.id;
    }

    addCell(cell){
        this.cells.set(cell.getId(), cell);
    }

    addDay(day){
        this.days.set(day.getId(), day);
    }
}