import * as THREE from 'three';
import { ToolAutoControl } from "./ToolAutoControl"
import { Tween } from "../utils/Tween"

export class RandomBoxAutoControl extends ToolAutoControl{
    constructor(context, view) {
        super(context, view);
        this.isLoop = true;
        this.dur = 60;
        this.cnt = 0;
        this.easing = new Tween().powerInOut;
        this.dx = Math.random() < 0.5 ? -1 : 1;
        this.dy = Math.random() < 0.5 ? -1 : 1;
        this.verticeTargets = this.randomVecs();
        this.verticeTargets2 = this.randomVecs();
        this.phase = 0;
        this.vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    }

    randomVecs() {
        const vecs = [];
        const xBase = (Math.random() - 0.5) * this.context.width;
        const yBase = (Math.random() - 0.5) * this.context.height;

        vecs.push( new THREE.Vector3 (
            xBase - (Math.random()) * this.context.width * 0.3 * this.dx,
            yBase - (Math.random()) * this.context.height * 0.3 * this.dy,
            0
        ));
        vecs.push( new THREE.Vector3 (
            xBase + (Math.random()) * this.context.width * 0.3 * this.dx,
            yBase - (Math.random()) * this.context.height * 0.3 * this.dy,
            0
        ));
        vecs.push( new THREE.Vector3 (
            xBase + (Math.random()) * this.context.width * 0.3 * this.dx,
            yBase + (Math.random()) * this.context.height * 0.3 * this.dy,
            0
        ));
        vecs.push( new THREE.Vector3 (
            xBase - (Math.random()) * this.context.width * 0.3 * this.dx,
            yBase + (Math.random()) * this.context.height * 0.3 * this.dy,
            0
        ));
        return vecs;
    }

    updateCommon() {
    }

    updateActive() {
        const t = this.easing(this.cnt / (this.dur - 1));
        if (this.phase == 0) {
            this.vertices[0] = this.verticeTargets[0];
            this.vertices[1] = this.verticeTargets[1];
            this.vertices[3] = this.verticeTargets[0].clone().lerp(this.verticeTargets[3], t);
            this.vertices[2] = this.verticeTargets[1].clone().lerp(this.verticeTargets[2], t);
            if (this.cnt == this.dur) { 
                this.phase = 1; 
                this.view.isInitialCoordInSync = false;
                this.cnt = 0;
            }
        } else {
            this.vertices[0] = this.verticeTargets[0].clone().lerp(this.verticeTargets2[0], t);
            this.vertices[1] = this.verticeTargets[1].clone().lerp(this.verticeTargets2[1], t);
            this.vertices[3] = this.verticeTargets[3].clone().lerp(this.verticeTargets2[3], t);
            this.vertices[2] = this.verticeTargets[2].clone().lerp(this.verticeTargets2[2], t);
            if (this.cnt == this.dur) {
                this.previewObj.visible = false;
                this.state = ToolAutoControl.states.DONE;
            }
        }
        this.cnt ++;
    }
}
