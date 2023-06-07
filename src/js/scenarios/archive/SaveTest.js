import { ScenarioBase } from "../ScenarioBase.js";
import { TestScene01 } from "../../scenes/TestScenes.js";
import { Menu } from "../../utils/Menu.js";

export class SaveTest extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setup();
        this.start();
        this.saveFlag = false;
        this.start();
    }

    setup() {
        this.scene = new TestScene01();
        const menuDef = [
            {label: "Save", key: "s", f: this.saveCanvasImage.bind(this)},
            {label: "Toggle Recording", key: "r", f: ()=>{this.saveFlag = !this.saveFlag;}},
            {label: "Save context as Json", key: "j", f: ()=>{this.saveObjAsJson(this.context)}},
            {label: "Load Json", key: "k", f: async ()=>{
                const o = await this.loadJsonAsObj(); console.log(o)}},
        ];
        this.menu = new Menu(menuDef)
    }

    update() {
        this.scene.update();
        this.context.renderer.render( this.scene.scene, this.context.camera);
        if (this.saveFlag) {
            this.saveCanvasImageSequence();
        }
    }
}