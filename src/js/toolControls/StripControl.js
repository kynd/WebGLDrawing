import * as THREE from 'three';
import { ToolControl } from './ToolControl.js';

export class StripControl extends ToolControl {

    constructor(context, view) {
        super(context, view);
        this.isLoop = false;
    }

    updateCreate() {
        const pointer = this.data.context.pointer;
        if (this.vertices.length == 0) {
            this.vertices.push(new THREE.Vector3(pointer.x, pointer.y, 0));
            this.vertices.push(new THREE.Vector3(pointer.x, pointer.y, 0));
        }

        this.vertices[this.vertices.length - 1].x = pointer.x;
        this.vertices[this.vertices.length - 1].y = pointer.y;
    }

    pointerDown() {
        if (this.state != ToolControl.states.CREATE) {
            return;
        }

        const pointer = this.data.context.pointer;
        const vp = new THREE.Vector3(pointer.x, pointer.y, 0);
        if (this.vertices[this.vertices.length - 2].distanceTo(vp) > 8) {
            this.vertices.push(vp);
        } else {
            if (this.vertices.length > 2) {
                this.vertices.pop();
            }
            this.state = ToolControl.states.STANDBY;
        }
    }

    pointerUp() {
        if (this.state != ToolControl.states.CREATE) {
            this.state = ToolControl.states.STANDBY;
        }
    }
}
