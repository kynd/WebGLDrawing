
import * as THREE from 'three';
import { DraggableTool } from './DraggableTool.js';
import { v, line, disposeObject, ovalFromCorners } from "../utils/DrawingUtil.js"
import { FloatDataTexture } from "../utils/FloatDataTexture.js"

export class OvalDraggableTool extends DraggableTool {
    static ready = false;
    static async init() {
        await DraggableTool.initMaterials();
        OvalDraggableTool.ready = true;
    }

    constructor(context) {
        super(context);
        this.sideBufferLength = 2048;
        this.sideTexture = new FloatDataTexture(null, this.sideBufferLength, 2);
    }

    updateViewsCreateCustom() {
        if (this.vertices.length == 0) {
            this.vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
            this.saveOrigin();
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
        this.pA = new THREE.Vector3(l, t, 0.0);
        this.pB = new THREE.Vector3(r, b, 0.0);
    }

    updateObjectsCommon() {
    }

    updatePreviewObj() {
        if (!this.previewObj) {
            const arr = Array(this.vertices.length + 1).fill(v(0,0,0));
            this.previewObj = new THREE.Object3D();
            this.outline = line(arr, 0x000000);
            this.previewObj.add(this.outline);
            this.vertices.forEach((v)=>{
                const handle = this.createHandleObj();
                this.handles.push(handle);
                this.previewObj.add(handle);
            })
        }

        const positions = this.outline.geometry.attributes.position;
        for (let i = 0; i <= 4; i ++) {
            const idx = i % 4;
            const p = this.vertices[idx];
            positions.setXYZ( i, p.x, p.y, p.z );
            this.handles[idx].position.copy(p);
        }
        positions.needsUpdate = true;
    }

    updateMainObj() {
        if (!this.mainObj) {
            const mainMaterial = this.getNewMaterial(this.context.selectedMaterial);;
            this.mainObj = new THREE.Mesh(new THREE.BufferGeometry(), mainMaterial);
            this.mainObj.toolRef = this;
        } else {
            this.mainObj.geometry.dispose();
        }
        this.sides = [
            [this.vertices[0].clone(), this.vertices[1].clone],
            [this.vertices[2].clone(), this.vertices[3].clone]
        ]

        const mainGeometry = ovalFromCorners(this.vertices);
        this.mainObj.geometry = mainGeometry;

        this.updateMainUniforms();
    }

    pointerDown() {
        return DraggableTool.results.END;
    }

    pointerUp() {
        return DraggableTool.results.END;
    }

    updateViewsAnimateCustom() {
        const center = v(0, 0, 0);
        this.vertices.forEach((vertice)=> {
            center.add(vertice);
        });
        center.divideScalar(this.vertices.length);
        this.vertices.forEach((vertice)=> {
            const diff = vertice.clone().sub(center);
            diff.applyAxisAngle(v(0,0,1), Math.PI / 60);
            vertice.copy(diff.add(center));
        });
    }
}
