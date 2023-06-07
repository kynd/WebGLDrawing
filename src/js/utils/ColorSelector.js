import $ from "jquery";
import * as THREE from 'three';
import { getRandomColor, hexToThreeColor } from "./ColorUtil";

export class ColorSelector {
    constructor(key = "`") {
        this.key = key;
        $(document).on("keypress", (evt)=>{
            if (evt.key == this.key) {
                this.toggleMenu();
            }
        });
        this.isMenuVisible = false;
        this.selectionColors = Array.from(new Array(4), getRandomColor);
        this.libraryColors = [];
        this.createMenu();
    }

    createMenu() {
        this.menuElm = $("<div>").prop({class: "color-menu"});
        this.selectionSectionElm = $("<div>").prop({class: "section"});
        this.librarySectionElm = $("<div>").prop({class: "section"});
        this.inputSectionElm = $("<div>").prop({class: "section"});

        this.menuElm.append(this.selectionSectionElm);
        this.menuElm.append(this.librarySectionElm);
        this.menuElm.append(this.inputSectionElm);
        this.selectionSwatches = [];
        this.librarySwatches = [];
        this.selectionColors.forEach((c, i)=> {
            const swatch = $("<div>").prop({class: "swatch"}).text(i + 1);
            swatch.on("click", ()=>{this.selectionClick(i)});
            this.selectionSectionElm.append(swatch);
            this.selectionSwatches.push(swatch);
        });

        this.previewSwatch = $("<div>").prop({class: "swatch"});
        this.inputSectionElm.append(this.previewSwatch);
        this.input = $("<input>").prop({type:"text", spellcheck: false, class: "color-input"});
        this.input.val("ffffff");
        this.inputSectionElm.append(this.input);

        $(this.input).on("keyup", (evt)=>{
            const str = this.input.val();
            const color =  hexToThreeColor(str);
            this.previewSwatch.css({background: "#" + color.getHexString()})
        });

        this.addButton = $("<div>").prop({class:"circle-button"}).text("+");
        this.inputSectionElm.append(this.addButton);
        this.addButton.on("click", this.onAddButtonClick.bind(this));
        this.update();
        $("body").append(this.menuElm);
    }

    onAddButtonClick() {
        const str = this.input.val();
        const color = hexToThreeColor(str);
        if (color) {
            this.addLibraryColor(color);
        }
    }

    addLibraryColor(color) {
        const i = this.libraryColors.length;
        this.libraryColors.push(color);

        const swatch = $("<div>").prop({class: "swatch"});
        swatch.css({background: "#" + color.getHexString()})
        swatch.on("click", ()=>{this.libraryClick(i)});
        this.librarySectionElm.append(swatch);
        this.librarySwatches.push(swatch);
    }

    generateLibraryFromImage(n, path) {
        const loader = new THREE.TextureLoader();
        loader.load (path, (texture)=> {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = texture.image.width;
            canvas.height = texture.image.height;
            context.drawImage(texture.image, 0, 0);

            for (let i = 0; i < n; i++) {
                const x = Math.floor(Math.random() * texture.image.width);
                const y = Math.floor(Math.random() * texture.image.height);
                const pixel = context.getImageData(x, y, 1, 1).data;
                const r = pixel[0];
                const g = pixel[1];
                const b = pixel[2];
                this.addLibraryColor(new THREE.Color(r / 255, g / 255, b / 255));
            }
        }, undefined,
        (e)=> {
            console.err('An error occurred while loading the image.', e);
        }
        );
    }

    selectionClick(i) {
        this.selectionColors.unshift(this.selectionColors[i]);
        this.selectionColors.pop();
        this.update();
    }

    libraryClick(i) {
        this.selectionColors.unshift(this.libraryColors[i]);
        this.selectionColors.pop();
        this.update();
    }

    update() {
        this.selectionSectionElm.html();
        this.selectionColors.forEach((c, i)=> {
            this.selectionSwatches[i].css({background: "#" + c.getHexString()})
        });
    }

    
    toggleMenu() {
        this.isMenuVisible = !this.isMenuVisible;
        this.menuElm.css({display: this.isMenuVisible ? "flex" : "none"})
    }
}