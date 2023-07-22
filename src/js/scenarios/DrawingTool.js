import * as THREE from 'three';
import $ from "jquery";
import { ScenarioBase } from "./ScenarioBase.js";
import { PingPong } from '../scenes/PingPong.js';
import { Menu } from "../utils/Menu.js";
import { ColorSelector } from "../utils/ColorSelector.js";
import { QuadDraggableTool } from "../draggableTools/QuadDraggableTool.js"

import { QuadView } from "../toolViews/QuadView.js";
import { OvalView } from "../toolViews/OvalView.js";
import { StrokeView } from "../toolViews/StrokeView.js";
import { BlobView } from "../toolViews/BlobView.js";
import { SpiralView } from "../toolViews/SpiralView.js";
import { WaveView } from "../toolViews/WaveView.js";
import { BoxControl } from "../toolControls/BoxControl.js";
import { StripControl } from "../toolControls/StripControl.js";
import { LoopControl } from "../toolControls/LoopControl.js";


/*
import { OvalDraggableTool } from "../draggableTools/OvalDraggableTool.js"
import { StrokeDraggableTool } from "../draggableTools/StrokeDraggableTool.js"
import { SpiralDraggableTool } from "../draggableTools/SpiralDraggableTool.js"
import { WaveDraggableTool } from "../draggableTools/WaveDraggableTool.js"
import { BlobDraggableTool } from "../draggableTools/BlobDraggableTool.js"
*/
import { SimpleImageScene } from '../scenes/SimpleImageScene.js';
import { DraggableTool } from '../draggableTools/DraggableTool.js';
import { ToolControl } from '../toolControls/ToolControl.js';

export class DrawingTool extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setToolList();
        this.setup();
        this.asyncStart();
        this.isToolDisplayVisible = false;
    }

    setToolList() {
        this.toolList = [
            {label: "Wave", key: "w", view: WaveView, control: StripControl},
            {label: "Spiral", key: "s", view: SpiralView, control: StripControl},
            {label: "Stroke", key: "s", view: StrokeView, control: StripControl},
            {label: "Blob", key: "b", view: BlobView, control: LoopControl},
            {label: "Oval", key: "o", view: OvalView, control: BoxControl},
            {label: "Quad", key: "q", view: QuadView, control: BoxControl}
            /*,
            {label: "Blob", key: "b", obj: BlobDraggableTool},
            {label: "Spiral", key: "r", obj: SpiralDraggableTool},
            {label: "Wave", key: "w", obj: WaveDraggableTool},
            {label: "Stroke", key: "s", obj: StrokeDraggableTool},
            */
        ]
    }

    setup() {
        this.scene = new THREE.Scene();
        this.mainScene = new THREE.Scene();
        this.pingPong = new PingPong(this.context, '../shaders/simple_image.frag');
        this.imageScene = new SimpleImageScene(this.context, '../img/hallway.jpg');

        this.activeTool = null;
        this.toolInstances = [];
        this.hitTargets = [];
        
        this.createMenu();
        this.createFillMenu();
        this.createColorSelector();
        this.bindShortCuts();

        QuadView.init();
    }

    createMenu() {
        const menuDef = [];
        this.toolList.forEach((toolDef)=>{
            menuDef.push({label: toolDef.label, key: toolDef.key, f: ()=>{this.selectTool(toolDef)}});
            toolDef.view.init();
            toolDef.params = {sizeA: 5, sizeB: 5}
        });
        this.selectTool(this.toolList[0])

        this.menu = new Menu(menuDef);
    }

    createFillMenu() {
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
    }

    createColorSelector() {
        this.colorSelector = new ColorSelector();
        this.context.colorSelector = this.colorSelector;
        this.colorSelector.generateLibraryFromImage(24, '../img/palette01.png');
    }

    bindShortCuts() {
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
            if (this.activeTool) {
                this.updateTool(this.activeTool);
            }
        });
    }

    selectTool(toolDef) {
        this.selectedToolDef = toolDef;
        this.context.toolParams = toolDef.params;
        this.updateToolDisplay();
    }

    async asyncStart() {
        this.wait(()=>{
            let ready = this.pingPong.ready && this.imageScene.ready; 
            //            && this.shaderTexture.ready;
            this.toolList.forEach((tool)=>{
                ready &= tool.view.ready;
            });
            ready &= QuadView.ready;
            if (ready) {
                this.quadView = new QuadView(this.context);
                this.quadView.vertices.push(new THREE.Vector3(-200, -200, 0));
                this.quadView.vertices.push(new THREE.Vector3(200, -200, 0));
                this.quadView.vertices.push(new THREE.Vector3(200, 200, 0));
                this.quadView.vertices.push(new THREE.Vector3(-200, 200, 0));

                this.quadView.update({
                    canvasTexture: this.pingPong.getCopyRenderTarget().texture,
                    referenceTexture: this.imageScene.texture,
                    context: this.context,
                    toolParams: this.selectedToolDef.params,
                    colors:[...this.colorSelector.selectionColors]
                });
                this.mainScene.add(this.quadView.viewObj);


                this.clear();
            }
            return ready;
        });
    }

    // --------------------------------------
    // ----- INTERACTIONS -------------------
    // --------------------------------------

    update() {
        this.context.renderer.autoClear = true;
        this.context.renderer.render( this.pingPong.scene, this.context.camera);

        this.context.renderer.autoClear = false;
        //this.context.renderer.render( this.imageScene.scene, this.context.camera);
        
        this.context.renderer.render( this.mainScene, this.context.camera);
        this.context.renderer.render( this.scene, this.context.camera);
        this.context.renderer.autoClear = true;
    }
    
    pointerMove(evt) {
        this.context.pointer = this.pointerCrdToSceneCrd(this.getPointerCrd(evt));
        
        const pointerCrd = this.getPointerCrdNormalized(evt);
        const hitTargets = [
            ...this.getPointerIntersects(pointerCrd),
            ...this.getPointerIntersects(pointerCrd, this.mainScene)
        ];
        this.hitTargets = hitTargets;

        if (this.activeTool) {
            this.updateTool(this.activeTool);
        }
    }

    pointerDown(evt) {
        this.checkDisposal();

        if (this.activeTool && this.activeTool.state == ToolControl.states.CREATE) {
            this.continueCreation(evt);
            return;
        } 

        const hitTarget = (this.hitTargets.length == 0) ? null : this.hitTargets[0].object.toolRef;

        if (this.activeTool && hitTarget != this.activeTool) {
            this.activeTool.endSelection();
        }
        
        if (hitTarget) {
            this.activeTool = this.hitTargets[0].object.toolRef;
            if (this.activeTool) {
                this.activeTool.startDrag(this.hitTargets[0].object);
            } 
        } else {
            const view = new this.selectedToolDef.view(this.context);
            const tool = new this.selectedToolDef.control(this.context, view);
            this.activeTool = tool;
            this.updateTool(this.activeTool);
            this.scene.add(this.activeTool.getPreviewObj());
            this.mainScene.add(this.activeTool.getMainObj());
            this.toolInstances.push(tool);
            //this.bringObjToTop(this.activeTool);
        }
    }

    continueCreation(evt) {
        this.activeTool.pointerDown();
    }
 
    pointerUp(evt) {
        if (this.activeTool) {
            const result = this.activeTool.pointerUp();
        }
    }

    endDrag() {
        this.isDragging = false;
        this.activeTool.endDrag();
        if (!this.toolInstances.some((tool)=> {
            return tool == this.activeTool})) {
            this.toolInstances.push(this.activeTool);
        }
        this.activeTool = null;
    }

    checkDisposal() {
        for (let i = this.toolInstances.length - 1; i >= 0; i --) {
            if (this.toolInstances[i].state == ToolControl.states.DISPOSE) {
                this.toolInstances[i].dispose();
                this.toolInstances.splice(i, 1);
            }
        }
    }

    // --------------------------------------
    // ----- COMMANDS -----------------------
    // --------------------------------------

    updateToolDisplay() {
        if (!this.toolDisplay) {
            this.toolDisplay = $("<div>").prop({class:"tool-display"});
            $("body").append(this.toolDisplay);
        }
        this.toolDisplay.css({display: this.isToolDisplayVisible ? "flex" : "none"});
        this.toolDisplay.html(`${this.selectedToolDef.label} | size A (,.): ${this.selectedToolDef.params.sizeA} | size B (;'): ${this.selectedToolDef.params.sizeB}`)
    }

    clear() {
        this.pingPong.clear();
    }

    print() {
        this.pingPong.renderOnCurrentRenderTarget(this.mainScene);
        this.pingPong.update();
        this.activeTool = null;
        this.toolInstances.forEach(tool=>{
            tool.dispose();
        })
        this.toolInstances = [];
        this.isDragging = false;
    }

    

    bringObjToTop(target) {
        /*
        const idx = this.toolInstances.findIndex(t => t === target);

        if (idx !== -1) {
            this.toolInstances.splice(idx, 1)[0];
            this.toolInstances.push(target);
        }
        this.toolInstances.forEach((tool, i) => {
            tool.mainObj.renderOrder = i;
        })
        */
    }
    /*
    pointerDownNew(evt) {
    }
    */

    updateTool(tool) {
        tool.update({
            canvasTexture: this.pingPong.getCopyRenderTarget().texture,
            referenceTexture: this.imageScene.texture,
            context: this.context,
            toolParams: this.selectedToolDef.params,
            colors:[...this.colorSelector.selectionColors]
        });
    }

    togglePreview() {
        this.isPreviewing = !this.isPreviewing;
    }
}