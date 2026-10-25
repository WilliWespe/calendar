class Window{

    constructor(){

        this.title = new String();
        this.content = new String();
        this.history = [];
        this.id = "window";

        this.render("test");

    }

    render(toRender){
        this.destroy();

        let windowContent;
        let windowTitle;
        if(toRender instanceof Cell){
            windowTitle = arrWeekDays[toRender.getDay().getWeekDayIndex()];
            windowContent = "Content";
        }
        else{
            windowTitle = "Title";
            windowContent = toRender;
        }

        // 1. Create the HTML string without the inline onclick attribute
        const windowHtml = `
            <div id="${this.id}">
                <div id="window-header">
                    <div id="window-title">${windowTitle}</div>
                    <div id="window-close">✖</div>
                </div>
                <div id="window-content-box">
                    <div id="window-content">${windowContent}</div>
                </div>
            </div>
        `;

        // 2. Convert string to a jQuery object, find the close button, and bind the click event safely
        const $window = $(windowHtml);
        $window.find("#window-close").on("click", () => {
            this.destroy(); 
        });

        // 3. Prepend the fully functional jQuery element to the body
        $("body").prepend($window);
    }

    destroy(){
        $("#"+this.id).remove();
    }

}