import * as THREE from 'three';
import {Noise} from "noisejs";
import $ from "jquery"

import { AutoDraw } from "../autoDraw/AutoDraw.js";
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
import { BasicControl } from '../../toolAutoControls/BasicControl.js';

export class WonderScenario extends AutoDraw {
    constructor() {
        super();
        this.cursor = new THREE.Vector3(0, 0, 0);
        this.noise = new Noise();
        this.activeTool = null;
    }

    updateTools() {
        if (this.toolInstances.length == 0) {
            this.addNewTool();
        }

        if (this.context.frameCount % 30 == 0) {
            if (this.activeTool.vertices.length > 5) {
                this.activeTool.state = ToolAutoControl.states.DONE;
            } else {
                this.activeTool.vertices.push(this.cursor.clone());
            }
        }

        const t = this.context.frameCount * 0.001;
        const spd = 5;
        this.cursor.x += this.noise.simplex2(t * 10.0, 123.4) * 2;
        this.cursor.y += this.noise.simplex2(t, 234.5) * 20;
        //this.cursor.x -= this.cursor.x * 0.02;
        this.cursor.y -= this.cursor.y * 0.02;
        this.activeTool.vertices[this.activeTool.vertices.length - 1].x = this.cursor.x;
        this.activeTool.vertices[this.activeTool.vertices.length - 1].y = this.cursor.y;
        
        this.toolInstances.forEach((tool) => {
            this.updateTool(tool);
        });
        if (this.activeTool.state == ToolAutoControl.states.DONE) {
            this.print();
            this.addNewTool();
        }
    }

    addNewTool() {
        this.context.selectedMaterial = this.materialKeys[Math.random() < 0.5 ? 3 : 1];
        this.noise.seed(Math.random());
        this.cursor.x = (Math.random() - 0.5) * this.context.width;
        this.cursor.y = (Math.random() - 0.5) * this.context.height * 1.5;
        const view = Math.random() < 0.5 ? new SpiralView(this.context) : new WaveView(this.context);
        view.toolParams = {sizeA: Math.random() * 4 + 1, sizeB: Math.random() * 8 + 2};
        const tool = new BasicControl(this.context, view);
        tool.vertices = [this.cursor.clone(), this.cursor.clone()];
        this.colorSelector.randomize();
        //console.log(this.colorSelector.selectionColors[0].r)
        view.colors = [...this.colorSelector.selectionColors];
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
        this.step ++;
        this.activeTool = tool;
        this.updateTool(tool);
    }

    updateTool(tool) {
        tool.update({
            canvasTexture: this.pingPong.getCopyRenderTarget().texture,
            referenceTexture: this.imageScene.texture,
            context: this.context,
            toolParams: this.selectedToolDef.params
        });
    }
}
