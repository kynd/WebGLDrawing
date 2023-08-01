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
import { RandomBoxAutoControl } from '../../toolAutoControls/RandomBoxAutoControl.js';
import { RandomStrokeAutoControl } from '../../toolAutoControls/RandomStrokeAutoControl.js';
import { BasicControl } from '../../toolAutoControls/BasicControl.js';

export class CompositionScenario extends AutoDraw {
    constructor() {
        super();
        this.printScene = new THREE.Scene();
        this.cursor = new THREE.Vector3(0, 0, 0);
        this.noise = new Noise();
        this.seed = Math.random() * 1000;
        this.activeTool = null;
    }

    updateTools() {
        this.grid = this.makeGrid();
        if (this.toolInstances.length == 0) {
            this.addTools();
        }

        this.setToolVertices();
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

    makeGrid() {
        const gridPoints = [];
        const N = 4;
        for (let i = 0; i <= N; i ++) {
            gridPoints.push([]);
            for (let j = 0; j <= N; j ++) {
                let x = (j / N - 0.5) * this.context.width;
                let y = (i / N - 0.5) * this.context.height;
                let sx = x, sy = y, sz = this.seed + this.context.frameCount * 0.01;
                if (i != 0 && i != N) {
                    y += this.noise.simplex3(sx, sy, sz) / N * this.context.height * 1.5;
                }
                if (j != 0 && j != N) {
                    x += this.noise.simplex3(sx, sy, sz + 1.2345) / N * this.context.width * 1.5;
                }
                gridPoints[i].push(new THREE.Vector3(x, y, 0));
            }   
        }
        return gridPoints;
    }

    addTools() {
        const arr = Array.from({ length: 4 }, () => new THREE.Vector3());
        for (let i = 0; i < this.grid.length - 1; i ++) {
            const row = this.grid[i];
            for (let j = 0; j < row.length - 1; j ++) {
                const r = Math.random();
                if (r < 0.33) {
                    this.addTool(new OvalView(this.context), arr);
                    this.toolInstances[this.toolInstances.length - 1].type = "Quad";
                } else if (r < 0.66) {
                    this.addTool(new SpiralView(this.context), this.fromVertsToWave(arr, 4));
                    this.toolInstances[this.toolInstances.length - 1].type = "Wave";
                } else {
                    this.addTool(new SpiralView(this.context), this.fromVertsToWave(arr, 4));
                    this.toolInstances[this.toolInstances.length - 1].type = "Wave";
                }
            }   
        }
    }

    setToolVertices() {
        for (let i = 0; i < this.grid.length - 1; i ++) {
            const row = this.grid[i];
            for (let j = 0; j < row.length - 1; j ++) {
                let p0 = this.grid[i][j];
                let p1 = this.grid[i + 1][j];
                let p2 = this.grid[i][j + 1];
                let p3 = this.grid[i + 1][j + 1];
                const idx = i * (row.length - 1) + j;
                this.toolInstances[idx].vertices = this.toolInstances[idx].type == "Wave" ? this.fromVertsToWave([p0, p1, p2, p3], 4) : [p0, p1, p3, p2];
            }   
        }
    }

    fromVertsToWave(v, n) {
        const vertices = [];
        for(let i = 0; i < n; i ++) {
            const t = i / (n - 1);
            vertices.push(v[0].clone().lerp(v[1], t));
            vertices.push(v[2].clone().lerp(v[3], t));
        }
        return vertices;
    }

    addTool(view, vertices) {
        this.context.selectedMaterial = this.materialKeys[Math.random() < 0.5 ? 1 : 0];
        this.colorSelector.randomize();
        const tool = new BasicControl(this.context, view);
        //view.toolParams = {sizeA: Math.random() * 4 + 0.5, sizeB: Math.random() * 4 + 0.5};
        view.toolParams = {sizeA: Math.random() * 8 + 0.5, sizeB: 1};
        tool.vertices = vertices;
        view.colors = [...this.context.colorSelector.selectionColors];
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
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
