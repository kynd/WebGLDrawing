import * as THREE from 'three';
import { ScenarioBase } from "./ScenarioBase.js";
import { PingPong } from '../scenes/PingPong.js';
import { CircleSpinnerTool } from '../tools/CircleSpinnerTool.js';
import { DragTapeTool } from '../tools/DragTapeTool.js';
import { DrifterTool } from '../tools/DrifterTool.js';
import { Menu } from "../utils/Menu.js";
import { SimpleImageScene } from '../scenes/SimpleImageScene.js';

export class ToolPrototype extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setToolList();
        this.setup();
        this.asyncStart();
    }

    setToolList() {
        this.toolList = [
            {label: "Drifter", obj: DrifterTool, key: "d"},
            {label: "DragTape", obj: DragTapeTool, key: "t"},
            {label: "Circle", obj: CircleSpinnerTool, key: "c"}
        ]
    }

    setup() {
        this.autoActors = [];
        this.scene = new THREE.Scene();
        this.printScene = new THREE.Scene();
        this.pingPong = new PingPong(this.context, '../shaders/simple_image.frag');
        this.isDragging = false;
        this.waitForToolToFinish = true;

        this.imageScene = new SimpleImageScene(this.context, '../img/hallway.jpg');

        const menuDef = [];
        this.toolList.forEach((tool)=>{
            menuDef.push({label: tool.label, key: tool.key, f: ()=>{this.tool = tool.obj}});
            tool.obj.init();
        })
        this.tool = this.toolList[0].obj;
        this.menu = new Menu(menuDef)
    }

    async asyncStart() {
        this.wait(()=>{
            let ready = this.pingPong.ready && this.imageScene.ready;
            this.toolList.forEach((tool)=>{
                ready &= tool.obj.ready;
            });
            return ready;
        });
    }

    update() {
        this.updateAutoActors();
        this.context.renderer.autoClear = false;
        this.context.renderer.render( this.pingPong.scene, this.context.camera);
        this.context.renderer.render( this.scene, this.context.camera);
        this.context.renderer.autoClear = true;

        //console.log(this.context.frameCount)
        /*
        if (this.context.frameCount <= 0) {
            this.pingPong.renderOnCurrentRenderTarget(this.imageScene.scene);
            this.pingPong.update();
        }
        */
    }

    updateAutoActors() {
        if (this.autoActors.length <= 0) {return;}
        if (this.waitForToolToFinish) {
            this.autoActors[0].updateAuto();
        } else {
            for (let i = this.autoActors.length -1; i >=0; i --) {
                const actor = this.autoActors[i];
                actor.updateAuto();
            }
        }
        for (let i = this.autoActors.length -1; i >=0; i --) {
            const actor = this.autoActors[i];
            if (actor.isDone) {
                this.printScene.add(actor.printObj);
                this.pingPong.renderOnCurrentRenderTarget(this.printScene);
                actor.dispose();
                this.autoActors.splice(i, 1);
                this.pingPong.update();
            }
        };
    }
    
    pointerMove(evt) {
        if (this.isDragging) {
            this.updateCurrentTool(evt);
        }
    }

    pointerDown(evt) {
        this.isDragging = true;
        this.toolInstance = new this.tool();
        this.updateCurrentTool(evt);
        this.scene.add(this.toolInstance.previewObj);
        this.scene.add(this.toolInstance.printObj);
    }

    updateCurrentTool(evt) {
        const crd = this.getPointerCrd(evt);
        this.toolInstance.updatePreview({
            pointer: this.pointerCrdToSceneCrd(crd),
            tex: this.pingPong.getCopyRenderTarget(),
            colorSource: this.imageScene.texture,
            context: this.context
        }, this.context);
    }

    pointerUp(evt) {
        this.isDragging = false;
        if (this.toolInstance) {
            this.autoActors.push(this.toolInstance);
            this.toolInstance.endPreview();
            this.toolInstance = null;
        }
    }
}
