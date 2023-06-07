import $ from "jquery";

export class Menu {
    constructor(def, key = " ") {
        this.def = def;
        this.key = key;
        $(document).on("keypress", (evt)=>{
            if (evt.key == this.key) {
                this.toggleMenu();
            } else {
                this.def.forEach(item => {
                    if (item.key == evt.key) {
                        item.f();
                    }
                });
            }
        });
        this.isMenuVisible = false;

        this.createMenu(this.def);
    }

    createMenu(def) {
        this.menuElm = $("<div>").prop({class: "menu"});
        def.forEach(item => {
            const itemElm = $("<div>").prop({class: "menu-item"});
            itemElm.text(item.label + ` (${item.key})`);
            itemElm.on("click", ()=>{item.f()});
            this.menuElm.append(itemElm);
        })
        $("body").append(this.menuElm);
    }

    toggleMenu() {
        this.isMenuVisible = !this.isMenuVisible;
        this.menuElm.css({display: this.isMenuVisible ? "flex" : "none"})
    }
}