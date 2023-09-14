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
import { BasicControl } from '../../toolAutoControls/BasicControl.js';

export class SamplerScenario extends AutoDraw {
    constructor() {
        super();
        this.printScene = new THREE.Scene();
        this.noise = new Noise();
        this.seed = Math.random() * 1000;
        this.context.clearColor = new THREE.Color(0xFF112244);
        this.details = 1.0;
    }

    customInit() {
        this.sourceBuffer = this.readRenderTargetToBuffer(this.imageScene.renderTarget);
        const bg = this.getColorFromBuffer(this.sourceBuffer, Math.random() * this.context.width, Math.random() * this.context.height);

        this.context.clearColor = new THREE.Color(bg);
        this.clear(bg);

        this.context.renderer.setRenderTarget(this.pingPong.getCurrentRenderTarget());
        //this.context.renderer.render( this.imageScene.scene, this.context.camera);
        this.context.renderer.setRenderTarget(null);

        this.printBuffer = this.readRenderTargetToBuffer(this.pingPong.getCurrentRenderTarget())
    }

    sampleSourceBuffer(x, y) {
        const sx = x + this.context.width * 0.5;
        const sy = y + this.context.height * 0.5;
        return this.getColorFromBuffer(this.sourceBuffer, sx, sy);
    }

    samplePrintBuffer(x, y) {
        const sx = x + this.context.width * 0.5;
        const sy = y + this.context.height * 0.5;
        return this.getColorFromBuffer(this.printBuffer, sx, sy);
    }

    updateTools() {
        if (this.context.frameCount == 0) {
            this.customInit();
        }

        if (this.details > 0.1) {
            for (let i = 0; i < 1; i ++) {
                this.generate();
            }
        } else {
            if (!this.done) {
                this.markAllDone();
            }
            this.done = true;
        }
        
        this.details -= 0.0005;

        this.toolInstances.forEach((tool) => {
            this.updateTool(tool);
        })

        if (this.toolInstances.length > 10) {
            this.markAllDone();
        }
    }

    markAllDone() {
        this.toolInstances.forEach((tool) => {
            tool.state = ToolAutoControl.states.DONE;
        })
        this.print();
    }

    generate() {
        let origin;
        for (let i = 0; i < 24; i ++) {
            origin = new THREE.Vector3((Math.random() - 0.5) * this.context.width, (Math.random() - 0.5) * this.context.height, 0);
            const oc = this.samplePrintBuffer(origin.x, origin.y);
            if (oc.equals(this.context.clearColor)) {
                break;
            }
        } 

        this.addStraightLine(origin);
        if (!this.addStrokeFill(origin)) {
            this.addStraightLine(origin);
        }
    }

    addStraightLine(origin) {
        const baseAng = 0;//Math.random() * Math.PI * 2;

        const points = [];
        let idx = 0, maxNPoints = 0;
        const aIter = 1, lIter = 120, threshold = 0.1 + this.details * 0.2;
        const oc = this.sampleSourceBuffer(origin.x, origin.y);
        for (let i = 0; i < aIter; i ++) {
            const ang = baseAng + Math.PI * 2 / aIter;
            let len = 0;
            points.push([]);
            let p = origin;
            let dir = new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0.0);
            for (let j = 0; j < lIter; j ++) {
                const step = 5;
                points[i].push(p.clone());
                dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), (Math.random() - 0.5) * 0.1);

                const c = this.sampleSourceBuffer(p.x, p.y);
                const d = Math.sqrt((c.r - oc.r) * (c.r - oc.r) + (c.g - oc.g) * (c.g - oc.g) + (c.b - oc.b) * (c.b - oc.b));
                if (d > threshold) {
                    break;
                }

                p.add(dir.clone().multiplyScalar(step));
                if (points[i].length > maxNPoints) {
                    maxNPoints = points[i].length;
                    idx = i;
                }
            }
        }

        const vertices = points[idx];
        if (vertices.length < 4) {
            return;
        }

        const view = new StrokeView(this.context);
        this.context.selectedMaterial = this.materialKeys[Math.floor(Math.random()  * 3)];
        const m = 0.2 + this.details;
        view.toolParams = {sizeA: Math.random() * 4 + 1, sizeB: Math.random() * 4 * m};
        const colors = [];
        for (let i = 0; i < 4; i ++) {
            colors.push(this.sampleSourceBuffer(vertices[i].x, vertices[i].y));
        }
        
        this.addTool(view, vertices, colors);
    }

    addStrokeFill(origin) {
        let count = 0;
        const rnd = ()=>Math.random() * 0.8 + 0.2;

        const dirs = [], corners = [];
        dirs.push(new THREE.Vector3(-rnd(), -rnd(), 0));
        dirs.push(new THREE.Vector3( rnd(), -rnd(), 0));
        dirs.push(new THREE.Vector3(-rnd(),  rnd(), 0));
        dirs.push(new THREE.Vector3( rnd(),  rnd(), 0));
        const rot = Math.random() * Math.PI;
        for (let i = 0; i < dirs.length; i ++) {
            //dirs[i].applyAxisAngle(new THREE.Vector3(0, 0, 1), rot);
        }

        const step = (5 + this.details * 35) / 10, iter = 50, threshold = 0.1 + this.details * 0.2;
        for (let i = 0; i < dirs.length; i ++) {
            const p = origin.clone();
            const oc = this.sampleSourceBuffer(origin.x, origin.y);
            for (let j = 0; j < iter; j ++) {
                const c = this.sampleSourceBuffer(p.x, p.y);
                const d = Math.sqrt((c.r - oc.r) * (c.r - oc.r) + (c.g - oc.g) * (c.g - oc.g) + (c.b - oc.b) * (c.b - oc.b));
                if (d > threshold) {
                    break;
                }
                count ++;
                p.add(dirs[i].clone().multiplyScalar(step));
            }
            corners.push(p);
        }
        corners[0].y -= 20;
        corners[1].y -= 20;
        corners[2].y += 20;
        corners[3].y += 20;

        let view, vertices;
        const r = Math.random();
        if (r < 0.66) {
            view = new StrokeView(this.context);
            vertices = this.fromVertsToWave(corners, 12);
            //view = new OvalView(this.context);
            //vertices = [corners[0], corners[1], corners[3], corners[2]];
        } else if (r < 0.88) {
            view = new WaveView(this.context);
            vertices = this.fromVertsToWave(corners, 4);
        } else {
            view = new SpiralView(this.context);
            vertices = this.fromVertsToWave(corners, 4);
        }

        if (count < 80) {
            return false;
        }
        const m = 0.2 + this.details;
        view.toolParams = {sizeA: Math.random() * 2 * m + 0.5, sizeB: Math.random() * 2 * m};

        const colors = [];
        for (let i = 0; i < 4; i ++) {
            colors.push(this.sampleSourceBuffer(corners[i].x, corners[i].y));
        }
        
        this.addTool(view, vertices, colors);
        return true;
    }

    addTool(view, vertices, colors) {
        this.context.selectedMaterial = this.materialKeys[Math.floor(Math.random()* 2)];
        const tool = new BasicControl(this.context, view);
        tool.vertices = vertices;
        view.colors = colors;
        this.scene.add(tool.getPreviewObj());
        this.mainScene.add(tool.getMainObj());
        this.toolInstances.push(tool);
    }

    fromVertsToWave(v, n) {
        const vertices = [];
        for(let i = 0; i < n; i ++) {
            const t = i / (n - 1);
            vertices.push(v[0].clone().lerp(v[2], t));
            vertices.push(v[1].clone().lerp(v[3], t));
        }
        return vertices;
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

        this.printBuffer = this.readRenderTargetToBuffer(this.pingPong.getCurrentRenderTarget())
    }
}
