import * as THREE from 'three';
import { Noise } from "noisejs";
import { createBezierCP, cpToBezier } from "../utils/DrawingUtil.js"
import { ToolAutoControl } from "./ToolAutoControl"
import { Tween } from "../utils/Tween"

export class RandomStrokeAutoControl extends ToolAutoControl{
    constructor(context, view) {
        super(context, view);
        this.dur = 60;
        this.cnt = 0;

        this.noise = new Noise();
        this.easing = new Tween().powerInOut;
        this.bezierPoints = this.randomBezier();
        //this.vertices = [];
    }

    randomBezier() {
        const sa = Math.random() * 100, sb = Math.random() * 100, sc = Math.random() * 100;
        const spd = 0.5;
        const N = 6;
        const points = [];
        for (let i = 0; i < N; i ++) {
            const t = i / N * spd;
            const x = this.noise.simplex3(sa, sb, t + sc) * this.context.width;
            const y = this.noise.simplex3(sa, sb, t + 123.4567 + sc) * this.context.height;
            points.push(new THREE.Vector3(x, y, 0));
        }

        const cp = createBezierCP(points);
        const bezierPoints = cpToBezier(cp);
        this.vertices = bezierPoints;
        return bezierPoints;
    }

    updateCommon() {
    }

    updateActive() {
        const t = this.cnt / this.dur;
        const ta = t * 0;
        this.vertices = [];
        const res = 12;
        for (let i = 0; i < (res - 1); i ++) {
            const tt = i / (res - 1);
            const ttt = ta * (1 - tt) + t * tt;
            this.vertices.push(this.bezierMP(this.bezierPoints, ttt));
        }

        if (this.cnt == this.dur) {
            this.previewObj.visible = false;
            this.state = ToolAutoControl.states.DONE;
        }
        this.cnt ++;
    }

    bezierMP(bezier, t) {
        const i0 = Math.floor(bezier.length * t);
        const i1 = Math.min(i0 + 1, bezier.length - 1);
        const tt = bezier.length * t - t;
        return bezier[i0].clone().lerp(bezier[i1], tt);
    }
}
