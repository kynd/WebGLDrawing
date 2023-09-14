import * as THREE from 'three';
import {Noise} from "noisejs";
import $ from "jquery"

import { AutoDraw } from "./AutoDraw.js";
import { ToolView } from "../../toolViews/ToolView.js";
import { QuadView } from "../../toolViews/QuadView.js";
import { OvalView } from "../../toolViews/OvalView.js";
import { StrokeView } from "../../toolViews/StrokeView.js";
import { BlobView } from "../../toolViews/BlobView.js";
import { SpiralView } from "../../toolViews/SpiralView.js";
import { WaveView } from "../../toolViews/WaveView.js";

import { ToolAutoControl } from '../../toolAutoControls/ToolAutoControl.js';
import { RandomBoxAuto3DControl } from '../../toolAutoControls/RandomBoxAuto3DControl.js';
import { RandomStroke3DAutoControl } from '../../toolAutoControls/RandomStroke3DAutoControl.js';
import { BasicControl } from '../../toolAutoControls/BasicControl.js';

export class Actors3DScenario extends AutoDraw {
    constructor() {
        super();
        // Camera
        const fov = 65;
        const hFovRadian = fov / 2 / 180 * Math.PI;
        const cz = this.context.height / 2 / Math.tan(hFovRadian);
        this.context.movingCamera = new THREE.PerspectiveCamera(fov, this.context.width/this.context.height, 0.1, cz * 2 );
        this.context.movingCamera.position.z = cz;


        this.context.clearColor = new THREE.Color(0xFFFFFFFF);
        this.context.renderer.setClearColor(this.context.clearColor);
        this.printScene = new THREE.Scene();
        this.cursor = new THREE.Vector3(0, 0, 0);
        this.noise = new Noise();
        this.activeTool = null;
    }

    updateTools() {
        if (this.context.frameCount % 240 == 0) {
           //this.clear(this.context.clearColor);
           //this.disposeAllTools();
        }
        if (this.toolInstances.length == 0) {
            this.addStrokeTool();
        }
        if ( Math.random() < 0.5 && this.toolInstances.length < 25) {
            if (Math.random() < 0.5) {
                this.addStrokeTool();
            } else {
                this.addBoxTool();
            }
        }

        let printFlag = false;
        this.toolInstances.forEach((tool) => {
            this.updateTool(tool);
        })

        this.toolInstances.forEach(tool=>{
            if (tool.state == ToolAutoControl.states.DONE) {
                tool.state = ToolAutoControl.states.DISPOSE;
            }
        })
        this.checkDisposal();
    }

    addBoxTool() {
        this.context.selectedMaterial = this.materialKeys[Math.random() < 0.5 ? 1 : 0];
        this.colorSelector.randomize();
        const view = new QuadView(this.context);
        const tool = new RandomBoxAuto3DControl(this.context, view);
        view.colors = [...this.context.colorSelector.selectionColors];
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
        this.step ++;
    }

    addStrokeTool() {
        this.context.selectedMaterial = this.materialKeys[Math.floor(Math.random() * 4)];
        this.colorSelector.randomize();
        const view = Math.random() < 0.5 ? new WaveView(this.context) : new StrokeView(this.context);
        const tool = new RandomStroke3DAutoControl(this.context, view);
        view.toolParams = {sizeA: Math.random() * 4, sizeB: Math.random() * 4};
        view.colors = [...this.context.colorSelector.selectionColors];
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
        this.step ++;
    }

    render() {
        this.context.renderer.autoClear = true;
        //this.context.renderer.render( this.pingPong.scene, this.context.camera);

        //sthis.context.renderer.autoClear = false;
        //this.context.renderer.render( this.imageScene.scene, this.context.camera);
        let a = this.context.frameCount / 240 * Math.PI;
        this.context.movingCamera.position.x = Math.sin(a) * 500;
        //this.context.movingCamera.position.z = 500;
        this.context.movingCamera.position.z = Math.cos(a) * 300 + 500;
        //this.context.movingCamera.lookAt(new THREE.Vector3(0, 0, 0));
        this.context.renderer.render( this.mainScene, this.context.movingCamera);
        //this.context.renderer.render( this.scene, this.context.movingCamera);
        this.context.renderer.autoClear = true;
    }

    print() {
        this.toolInstances.forEach(tool=>{
            if (tool.state == ToolAutoControl.states.DONE) {
                this.printScene.add(tool.getMainObj());
                tool.state = ToolAutoControl.states.DISPOSE;
            }
        })

        this.pingPong.renderOnCurrentRenderTarget(this.printScene);
        this.pingPong.update();
        this.activeTool = null;
        this.checkDisposal();
    }
}
