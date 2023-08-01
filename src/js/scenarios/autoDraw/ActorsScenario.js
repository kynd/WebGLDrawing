import * as THREE from 'three';
import {Noise} from "noisejs";
import $ from "jquery"

import { AutoDraw } from "../autoDraw/AutoDraw.js";
import { ToolView } from "../../toolViews/ToolView.js";
import { QuadView } from "../../toolViews/QuadView.js";
import { OvalView } from "../../toolViews/OvalView.js";
import { StrokeView } from "../../toolViews/StrokeView.js";
import { BlobView } from "../../toolViews/BlobView.js";
import { SpiralView } from "../../toolViews/SpiralView.js";
import { WaveView } from "../../toolViews/WaveView.js";

import { ToolAutoControl } from '../../toolAutoControls/ToolAutoControl.js';
import { RandomBoxAutoControl } from '../../toolAutoControls/RandomBoxAutoControl.js';
import { RandomStrokeAutoControl } from '../../toolAutoControls/RandomStrokeAutoControl.js';
import { BasicControl } from '../../toolAutoControls/BasicControl.js';

export class ActorsScenario extends AutoDraw {
    constructor() {
        super();
        this.printScene = new THREE.Scene();
        this.cursor = new THREE.Vector3(0, 0, 0);
        this.noise = new Noise();
        this.activeTool = null;
    }

    updateTools() {
        if (this.toolInstances.length == 0) {
            this.addStrokeTool();
        }
        if (this.toolInstances.length < 3 && Math.random() < 0.05) {
            if (Math.random() < 0.75) {
                this.addStrokeTool();
            } else {
                this.addNewTool();
            }
        }
        let printFlag = false;
        this.toolInstances.forEach((tool) => {
            this.updateTool(tool);
            if (tool.state == ToolAutoControl.states.DONE) {
                printFlag = true;
            }
        })

        if (printFlag) {
            this.print();
        }
    }

    addNewTool() {
        this.context.selectedMaterial = this.materialKeys[Math.random() < 0.5 ? 1 : 0];
        this.colorSelector.randomize();
        const view = new OvalView(this.context);
        const tool = new RandomBoxAutoControl(this.context, view);
        view.colors = [...this.context.colorSelector.selectionColors];
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
        this.step ++;
    }

    addStrokeTool() {
        this.context.selectedMaterial = this.materialKeys[Math.random() < 0.5 ? 2 : 3];
        this.colorSelector.randomize();
        const view = Math.random() < 0.5 ? new WaveView(this.context) : new StrokeView(this.context);
        const tool = new RandomStrokeAutoControl(this.context, view);
        view.toolParams = {sizeA: Math.random() * 4, sizeB: Math.random() * 4};
        view.colors = [...this.context.colorSelector.selectionColors];
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
        this.step ++;
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
