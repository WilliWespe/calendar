class Cell {

    constructor(isHeader){
        
        if(isHeader){
            this.type = "header";
            this.day = null;
        }
        else{
            this.type = "dayCell";
            this.day = new Day();
        }

        this.id = new String();
        this.additionalInformation = new Map();
    }

    setID(id){
        this.id = id;
    }

    getID(){
        return this.id;
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
}