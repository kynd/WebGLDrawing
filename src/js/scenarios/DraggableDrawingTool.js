import * as THREE from 'three';
import $ from "jquery";
import { ScenarioBase } from "./ScenarioBase.js";
import { PingPong } from '../scenes/PingPong.js';
import { Menu } from "../utils/Menu.js";
import { ColorSelector } from "../utils/ColorSelector.js";
import { QuadStripeDraggableTool } from "../draggableTools/QuadDraggableTool.js"
import { StrokeStripeDraggableTool } from "../draggableTools/StrokeDraggableTool.js"
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
        this.isAnimating = false;
        this.isPreviewing = false;
        $("body").on("keydown", (evt)=> {
            if (evt.key === "Enter") {
                this.toggleAnimation();
            }
            if (evt.key === "\\") {
                this.togglePreview();
            }
        });
    }

    setToolList() {
        this.toolList = [
            {label: "Stroke", key: "s", obj: StrokeStripeDraggableTool},
            {label: "Quad", key: "q", obj: QuadStripeDraggableTool}
        ]
    }

    setup() {
        this.scene = new THREE.Scene();
        this.mainScene = new THREE.Scene();
        this.printScene = new THREE.Scene();
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
        this.toolList.forEach((tool)=>{
            menuDef.push({label: tool.label, key: tool.key, f: ()=>{this.tool = tool.obj}});
            tool.obj.init();
        })
        this.tool = this.toolList[0].obj;
        this.menu = new Menu(menuDef);

        this.colorSelector = new ColorSelector();
        this.colorSelector.generateLibraryFromImage(24, '../img/hallway.jpg')
    }

    async asyncStart() {
        this.wait(()=>{
            let ready = this.pingPong.ready && this.imageScene.ready 
                        && this.shaderTexture.ready;
            this.toolList.forEach((tool)=>{
                ready &= tool.obj.ready;
            });
            return ready;
        });
    }

    update() {
        if (this.isAnimating) {
            this.updateAnimation();
        }

        this.shaderTexture.update();
        this.context.renderer.autoClear = false;
        this.context.renderer.render( this.pingPong.scene, this.context.camera);
        this.context.renderer.render( this.imageScene.scene, this.context.camera);
        
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

    pointerDownNew(evt) {
        this.isDragging = true;
        this.dragStartPoint = this.getPointerCrd(evt);
        if (this.hitTargets.length > 0 && this.hitTargets[0].object) {
            this.currentTool = this.hitTargets[0].object.toolRef;
            this.currentTool.startDrag(this.hitTargets[0].object);
            this.mainScene.remove(this.currentTool.mainObj);
            this.mainScene.add(this.currentTool.mainObj);
        } else {
            this.currentTool = new this.tool();
            this.updateTool(this.currentTool);
            this.scene.add(this.currentTool.previewObj);
            this.mainScene.add(this.currentTool.mainObj);
        }
    }

    updateTool(tool) {
        tool.update({
            canvasTexture: this.pingPong.getCopyRenderTarget().texture,
            referenceTexture: this.imageScene.texture,
            context: this.context,
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

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        if (this.isAnimating && this.toolInstances) {
            this.toolInstances.forEach((tool)=>{
                if (tool.state == DraggableTool.states.IDLE) {
                    tool.startAnimation()
                }
            });
        }
    }

    togglePreview() {
        this.isPreviewing = !this.isPreviewing;
    }

    updateAnimation() {
        if (this.toolInstances) {
            this.toolInstances.forEach((tool)=>{
                if (tool.state == DraggableTool.states.IDLE) {
                    this.updateTool(tool);
                }
            })
        };
    }
}
