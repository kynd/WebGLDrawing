import * as THREE from 'three';
import { Noise } from "noisejs";
import { createBezierCP, cpToBezier } from "../utils/DrawingUtil.js"
import { ToolAutoControl } from "./ToolAutoControl.js"
import { Tween } from "../utils/Tween.js"

export class RandomStroke3DAutoControl extends ToolAutoControl{
    constructor(context, view) {
        super(context, view);
        this.dur = 120;
        this.cnt = 0;

        this.noise = new Noise();
        this.easing = new Tween().powerInOut;
        this.bezierPoints = this.randomBezier();
        this.phase = "expand";
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
            const z = this.noise.simplex3(sa, sb, t + 345.6789 + sc) * this.context.height;
            points.push(new THREE.Vector3(x, y, z));
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
        this.vertices = [];
        const res = 12;

        if (t < 1.0) {
            for (let i = 0; i < (res - 1); i ++) {
                const tt = i / (res - 1);
                const ttt = t * tt;
                this.vertices.push(this.bezierMP(this.bezierPoints, ttt));
            }
        } else if (t < 2.0) {
            for (let i = 0; i < (res - 1); i ++) {
                const tt = i / (res - 1);
                const ttt = 1 - (2 - t) * (1 - tt);
                this.vertices.push(this.bezierMP(this.bezierPoints, ttt));
            }
        }

        if (this.cnt >= this.dur * 2) {
            this.previewObj.visible = false;
            this.state = ToolAutoControl.states.DONE;
        }
        this.cnt ++;
    }

    bezierMP(bezier, t) {
        const i0 = Math.min(Math.floor(bezier.length * t), bezier.length - 1);
        const i1 = Math.min(i0 + 1, bezier.length - 1);
        const tt = bezier.length * t - t;

        return bezier[i0].clone().lerp(bezier[i1], tt);
    }
}
