import * as THREE from 'three';
import $ from "jquery"

import { ScenarioBase } from "../ScenarioBase.js";
import { PingPong } from '../../scenes/PingPong.js';
import { SimpleImageScene } from '../../scenes/SimpleImageScene.js';

import { ColorSelector } from "../../utils/ColorSelector.js";

import { ToolView } from "../../toolViews/ToolView.js";
import { QuadView } from "../../toolViews/QuadView.js";
import { OvalView } from "../../toolViews/OvalView.js";
import { StrokeView } from "../../toolViews/StrokeView.js";
import { BlobView } from "../../toolViews/BlobView.js";
import { SpiralView } from "../../toolViews/SpiralView.js";
import { WaveView } from "../../toolViews/WaveView.js";

import { ToolAutoControl } from '../../toolAutoControls/ToolAutoControl.js';
import { BoxExpandAutoControl } from '../../toolAutoControls/BoxExpandAutoControl.js';

export class AutoDraw extends ScenarioBase {
    constructor() {
        super();
        this.isSaving = false;
        this.setupContext(1920, 1920);
        this.setup();
        this.asyncStart();
    }

    setup() {
        this.endSavingFrame = 60 * 4 * 8;
        this.scene = new THREE.Scene();
        this.mainScene = new THREE.Scene();
        this.pingPong = new PingPong(this.context, '../shaders/simple_image.frag');
        this.imageScene = new SimpleImageScene(this.context, '../img/ocean02.png');

        this.context.clearColor = new THREE.Color(0xFFFFFFFF);

        this.step = 0;
        this.activeTool = null;
        this.toolInstances = [];

        this.toolList = [
            {label: "Quad", view: QuadView},
            {label: "Wave", view: WaveView},
            {label: "Spiral", view: SpiralView},
            {label: "Stroke", view: StrokeView},
            {label: "Blob", view: BlobView},
            {label: "Oval", view: OvalView}
        ]
        this.selectedToolDef = this.toolList[0];
        
        this.materialKeys = [];
        for (let key in ToolView.materials) {
            if (ToolView.materials.hasOwnProperty(key)) {
                this.materialKeys.push(key);
            }
        }

        this.context.selectedMaterial = this.materialKeys[0];

        this.toolList.forEach((toolDef)=>{
            toolDef.view.init();
        });

        this.createColorSelector();

        $(document).on("keypress", (evt)=>{
            if (evt.key == "p") { this.saveCanvasImage(); }
        });
    }

    createColorSelector() {
        this.colorSelector = new ColorSelector();
        this.context.colorSelector = this.colorSelector;
        this.colorSelector.generateLibraryFromImage(24, '../img/palette02.png');
    }

    async asyncStart() {
        this.wait(()=>{
            let ready = this.pingPong.ready && this.imageScene.ready; 
            //            && this.shaderTexture.ready;
            this.toolList.forEach((tool)=>{
                ready &= tool.view.ready;
            });

            if (ready) {
                this.clear(this.context.clearColor);

                if (this.isSaving) {
                    if (!this.hasPickerAdded) {
                        this.hasPickerAdded = true;
                        $("body").on("click", async ()=> {
                            await this.showDirectoryPicker();
                            console.log("READY");
                            this.ready = true;
                        });
                    }
                } else {
                    this.ready = true;
                }
            } 
            return this.ready;
        });
    }

    // --------------------------------------
    // ----- UPDATES -------------------
    // --------------------------------------

    update() {
        this.updateTools();
        this.render();

        if (this.isSaving && this.context.frameCount < this.endSavingFrame) {
            if (this.context.frameCount % 2 == 0) {
                this.saveCanvasImageSequence();
            }
        }
    }

    updateTools() {
        if (this.toolInstances.length == 0) {
            this.addNewTool();
        }
        this.toolInstances.forEach((tool) => {
            this.updateTool(tool);
            if (tool.state == ToolAutoControl.states.DONE) {
                this.colorSelector.randomize();
                this.print();
            }
        })
    }

    render() {
        this.context.renderer.autoClear = true;
        this.context.renderer.render( this.pingPong.scene, this.context.camera);

        this.context.renderer.autoClear = false;
        //this.context.renderer.render( this.imageScene.scene, this.context.camera);
        
        this.context.renderer.render( this.mainScene, this.context.camera);
        this.context.renderer.render( this.scene, this.context.camera);
        this.context.renderer.autoClear = true;
    }

    addNewTool() {
        const n = 4;
        const maxD = Math.sqrt(this.context.width * this.context.width + this.context.height * this.context.height) * (0.5 + 0.5 / n) ;
        const w = maxD / n * 0.5;

        const a0 = this.step * Math.PI * 0.5 + Math.PI * 0.25;
        const a1 = (this.step + 1) * Math.PI * 0.5 + Math.PI * 0.25;
        const r0 = Math.max(0, maxD - w * this.step * 0.2);
        const r1 = Math.max(0, r0 - w);
        const r2 = Math.max(0, maxD - w * (this.step + 1) * 0.2);
        const r3 = Math.max(0, r2 - w);
        const c0 = Math.cos(a0);
        const c1 = Math.cos(a1);
        const s0 = Math.sin(a0);
        const s1 = Math.sin(a1);

        if (r0 == 0 && r2 == 0) {
            return;
        }

        const view = new QuadView(this.context);
        const tool = new BoxExpandAutoControl(this.context, view);
        tool.verticeTargets = [
            new THREE.Vector3(c0 * r0, s0 * r0, 0),            
            new THREE.Vector3(c0 * r1, s0 * r1, 0),            
            new THREE.Vector3(c1 * r3, s1 * r3, 0),
            new THREE.Vector3(c1 * r2, s1 * r2, 0)
        ]
        view.colors = [...this.context.colorSelector.selectionColors];
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
        this.step ++;
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
    
    checkDisposal() {
        for (let i = this.toolInstances.length - 1; i >= 0; i --) {
            if (this.toolInstances[i].state == ToolAutoControl.states.DISPOSE) {
                this.toolInstances[i].dispose();
                this.toolInstances.splice(i, 1);
            }
        }
    }

    clear(color) {
        this.pingPong.clear(color);
    }

    print() {
        this.pingPong.renderOnCurrentRenderTarget(this.mainScene);
        this.pingPong.update();
        this.activeTool = null;
        this.disposeAllTools();
    }

    disposeAllTools() {
        this.toolInstances.forEach(tool=>{
            tool.dispose();
        })
        this.toolInstances = [];
    }
}
