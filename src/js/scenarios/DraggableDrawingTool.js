import * as THREE from 'three';
import $ from "jquery";
import { ScenarioBase } from "./ScenarioBase.js";
import { PingPong } from '../scenes/PingPong.js';
import { Menu } from "../utils/Menu.js";
import { ColorSelector } from "../utils/ColorSelector.js";
import { QuadDraggableTool } from "../draggableTools/QuadDraggableTool.js"
import { OvalDraggableTool } from "../draggableTools/OvalDraggableTool.js"
import { StrokeDraggableTool } from "../draggableTools/StrokeDraggableTool.js"
import { SpiralDraggableTool } from "../draggableTools/SpiralDraggableTool.js"
import { WaveDraggableTool } from "../draggableTools/WaveDraggableTool.js"
import { BlobDraggableTool } from "../draggableTools/BlobDraggableTool.js"
import { SimpleImageScene } from '../scenes/SimpleImageScene.js';
import { ShaderTextureMaker } from "../utils/ShaderTextureMaker.js"
import { DraggableTool } from '../draggableTools/DraggableTool.js';

export class DraggableDrawingTool extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setToolList();
        this.setup();
        this.asyncStart();
        this.isPreviewing = false;
        this.isToolDisplayVisible = false;
    }

    setToolList() {
        this.toolList = [
            {label: "Quad", key: "q", obj: QuadDraggableTool},
            {label: "Blob", key: "b", obj: BlobDraggableTool},
            {label: "Spiral", key: "r", obj: SpiralDraggableTool},
            {label: "Wave", key: "w", obj: WaveDraggableTool},
            {label: "Stroke", key: "s", obj: StrokeDraggableTool},
            {label: "Oval", key: "o", obj: OvalDraggableTool}
        ]
    }

    setup() {
        this.scene = new THREE.Scene();
        this.mainScene = new THREE.Scene();
        //this.printScene = new THREE.Scene();
        this.pingPong = new PingPong(this.context, '../shaders/simple_image.frag');
        this.imageScene = new SimpleImageScene(this.context, '../img/hallway.jpg');

        this.isDragging = false;
        this.waitForToolToFinish = true;
        this.currentTool = null;
        this.toolInstances = [];
        this.dragStartPoint = null;
        this.hitTargets = [];

        this.shaderTexture = new ShaderTextureMaker(this.context.width / 2, this.context.height / 2, '../shaders/ShaderTextureMakerTest.frag', this.context);

        const menuDef = [];
        this.toolList.forEach((toolDef)=>{
            menuDef.push({label: toolDef.label, key: toolDef.key, f: ()=>{this.selectTool(toolDef)}});
            toolDef.obj.init();
            toolDef.params = {sizeA: 5, sizeB: 5}
        });
        this.selectTool(this.toolList[0])

        this.menu = new Menu(menuDef);

        const fillMenuDef = [];
        for (let key in DraggableTool.materials) {
            if (!this.context.selectedMaterial) {
                this.context.selectedMaterial = key;
            }
            if (DraggableTool.materials.hasOwnProperty(key)) {
                fillMenuDef.push({label: key, key: DraggableTool.materials[key].key, f: ()=>{this.context.selectedMaterial = key}});
            }
        }
        this.fillMenu = new Menu(fillMenuDef, "]");

        this.colorSelector = new ColorSelector();
        this.context.colorSelector = this.colorSelector;
        this.colorSelector.generateLibraryFromImage(24, '../img/palette01.png');

        $(document).on("keypress", (evt)=>{
            if (evt.key === "\\") { this.togglePreview(); }
            if (evt.key == " ") { 
                this.isToolDisplayVisible = !this.isToolDisplayVisible; this.updateToolDisplay(); }
            if (evt.key == ",") { this.selectedToolDef.params.sizeA = Math.max(1, this.selectedToolDef.params.sizeA - 1); this.updateToolDisplay()}
            if (evt.key == ".") { this.selectedToolDef.params.sizeA = Math.min(10, this.selectedToolDef.params.sizeA + 1); this.updateToolDisplay()}
            if (evt.key == ";") { this.selectedToolDef.params.sizeB = Math.max(1, this.selectedToolDef.params.sizeB - 1); this.updateToolDisplay()}
            if (evt.key == "'") { this.selectedToolDef.params.sizeB = Math.min(10, this.selectedToolDef.params.sizeB + 1); this.updateToolDisplay()}
            if (evt.key == "z") { this.colorSelector.randomize(); }
            if (evt.key == "p") { this.print(); }
            if (evt.key == "c") { this.clear(); }
        });
    }

    selectTool(toolDef) {
        this.tool = toolDef.obj;
        this.selectedToolDef = toolDef;
        this.context.toolParams = toolDef.params;
        this.updateToolDisplay();
    }

    updateToolDisplay() {
        if (!this.toolDisplay) {
            this.toolDisplay = $("<div>").prop({class:"tool-display"});
            $("body").append(this.toolDisplay);
        }
        this.toolDisplay.css({display: this.isToolDisplayVisible ? "flex" : "none"});
        this.toolDisplay.html(`${this.selectedToolDef.label} | size A (,.): ${this.selectedToolDef.params.sizeA} | size B (;'): ${this.selectedToolDef.params.sizeB}`)
    }

    async asyncStart() {
        this.wait(()=>{
            let ready = this.pingPong.ready && this.imageScene.ready 
                        && this.shaderTexture.ready;
            this.toolList.forEach((tool)=>{
                ready &= tool.obj.ready;
            });
            if (ready) {this.clear();}
            return ready;
        });
    }

    clear() {
        this.pingPong.clear();
    }

    print() {
        this.pingPong.renderOnCurrentRenderTarget(this.mainScene);
        this.pingPong.update();
        this.currentTool = null;
        this.toolInstances.forEach(tool=>{
            tool.dispose();
        })
        this.toolInstances = [];
        this.isDragging = false;
    }

    update() {
        this.shaderTexture.update();
        this.context.renderer.autoClear = true;
        this.context.renderer.render( this.pingPong.scene, this.context.camera);

        this.context.renderer.autoClear = false;
        //this.context.renderer.render( this.imageScene.scene, this.context.camera);
        
        this.context.renderer.render( this.mainScene, this.context.camera);
        if (this.isPreviewing) {
            this.context.renderer.render( this.scene, this.context.camera);
        }
        this.context.renderer.autoClear = true;
    }
    
    pointerMove(evt) {
        this.context.pointer = this.pointerCrdToSceneCrd(this.getPointerCrd(evt));
        if (this.isDragging) {
            this.updateTool(this.currentTool);
            this.bringObjToTop(this.currentTool);
        } else {
            const pointerCrd = this.getPointerCrdNormalized(evt);
            const hitTargets = [
                ...this.getPointerIntersects(pointerCrd),
                ...this.getPointerIntersects(pointerCrd, this.mainScene)
            ];
            this.hitTargets = hitTargets;
        }
    }

    pointerDown(evt) {
        if (this.currentTool && this.isDragging) {
            this.pointerDownWhileDragging(evt);
        } else {
            this.pointerDownNew(evt);
        }
    }

    pointerDownWhileDragging(evt) {
        const result = this.currentTool.pointerDown();
        if (result == DraggableTool.results.END) {
            this.endDrag();
        }
    }

    bringObjToTop(target) {
        const idx = this.toolInstances.findIndex(t => t === target);

        if (idx !== -1) {
            this.toolInstances.splice(idx, 1)[0];
            this.toolInstances.push(target);
        }
        this.toolInstances.forEach((tool, i) => {
            tool.mainObj.renderOrder = i;
        })
    }

    pointerDownNew(evt) {
        this.isDragging = true;
        this.dragStartPoint = this.getPointerCrd(evt);
        if (this.hitTargets.length > 0 && this.hitTargets[0].object) {
            this.currentTool = this.hitTargets[0].object.toolRef;
            if (this.currentTool) {
                this.currentTool.startDrag(this.hitTargets[0].object);
                //this.bringObjToTop(this.currentTool);
            } else {
                this.isDragging = false;
            }
        } else {
            this.currentTool = new this.tool(this.context);
            this.updateTool(this.currentTool);
            this.scene.add(this.currentTool.previewObj);
            this.mainScene.add(this.currentTool.mainObj);
            //this.bringObjToTop(this.currentTool);
        }
    }

    updateTool(tool) {
        tool.update({
            canvasTexture: this.pingPong.getCopyRenderTarget().texture,
            referenceTexture: this.imageScene.texture,
            context: this.context,
            toolParams: this.selectedToolDef.params,
            colors:[...this.colorSelector.selectionColors]
        });
    }

    pointerUp(evt) {
        if (this.currentTool) {
            const result = this.currentTool.pointerUp();
            if (result == DraggableTool.results.END) {
                this.endDrag();
            }
        }
    }

    endDrag() {
        this.isDragging = false;
        this.currentTool.endDrag();
        if (!this.toolInstances.some((tool)=> {
            return tool == this.currentTool})) {
            this.toolInstances.push(this.currentTool);
        }
        this.currentTool = null;
    }

    togglePreview() {
        this.isPreviewing = !this.isPreviewing;
    }
}
