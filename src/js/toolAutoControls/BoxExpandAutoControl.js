import * as THREE from 'three';
import { ToolAutoControl } from "./ToolAutoControl"
import { Tween } from "../utils/Tween"

export class BoxExpandAutoControl extends ToolAutoControl{
    constructor(context, view) {
        super(context, view);
        this.isLoop = true;
        this.dur = 60;
        this.cnt = 0;
        this.easing = new Tween().powerInOut;
        this.verticeTargets = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        this.vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    }

    updateCommon() {
    }

    updateActive() {
        const t = this.easing(this.cnt / (this.dur - 1));
        this.vertices[0] = this.verticeTargets[0];
        this.vertices[1] = this.verticeTargets[1];

        this.vertices[3] = this.verticeTargets[0].clone().lerp(this.verticeTargets[3], t);
        this.vertices[2] = this.verticeTargets[1].clone().lerp(this.verticeTargets[2], t);
        this.cnt ++;
        if (this.cnt == this.dur) {
            this.previewObj.visible = false;
            this.state = ToolAutoControl.states.DONE;
        }
    }
}
