import * as THREE from 'three';
import { ToolControl } from './ToolControl.js';

export class BoxControl extends ToolControl{

    constructor(context, view) {
        super(context, view);
        this.isLoop = true;
    }

    updateCreate() {
        if (this.vertices.length == 0) {
            this.vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        }
        const pointer = this.data.context.pointer;
        const l = Math.min(this.origin.x, pointer.x);
        const r = Math.max(this.origin.x, pointer.x);
        const t = Math.min(this.origin.y, pointer.y);
        const b = Math.max(this.origin.y, pointer.y);
        this.vertices[0].x = l; this.vertices[0].y = t; 
        this.vertices[1].x = r; this.vertices[1].y = t; 
        this.vertices[2].x = r; this.vertices[2].y = b; 
        this.vertices[3].x = l; this.vertices[3].y = b;
    }

    pointerUp() {
        if (this.state == ToolControl.states.CREATE && 
            this.moveDistance() < 4) {
                this.state = ToolControl.states.DISPOSE;
        } else {
            this.state = ToolControl.states.STANDBY;
        }
    }
}