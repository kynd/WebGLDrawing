
import * as THREE from 'three';

import { DraggableTool } from './DraggableTool.js';
import { v, line, disposeObject, createBezierCP, createBezierCP2, cpToBezier, stripSidesFromArray} from "../utils/DrawingUtil.js"
import { stripGeomDataFromSides, dataToGeom} from "../utils/GeomUtil.js"
import { FloatDataTexture} from '../utils/FloatDataTexture.js';
import { Vector3 } from 'three';


export class WaveDraggableTool extends DraggableTool {
    static ready = false;
    static async init() {
        await DraggableTool.initMaterials();
        WaveDraggableTool.ready = true;
    }

    constructor(context) {
        super(context);
        this.width = context.toolParams.sizeA * 20;
        this.waveWidth = context.toolParams.sizeB * 40;
        this.sideBufferLength = 2048;
        this.sideTexture = new FloatDataTexture(null, this.sideBufferLength, 2);
    }

    updateViewsCreateCustom() {
        const pointer = this.data.context.pointer;
        if (this.vertices.length == 0) {
            this.vertices.push(v(pointer.x, pointer.y, 0));
            this.vertices.push(v(pointer.x, pointer.y, 0));
        }

        this.vertices[this.vertices.length - 1].x = pointer.x;
        this.vertices[this.vertices.length - 1].y = pointer.y;
    }

    updateObjectsCommon() {
        if (this.vertices.length > 1) {
            const cp = createBezierCP2(this.vertices);
            this.bezierPoints = cpToBezier(cp, 8);
            let pp = this.bezierPoints[0].clone();
            let d = 0;
            this.bezierPoints.forEach((p, i) => {
                    d += pp.distanceTo(p);
                    const dir = p.clone().sub(pp).normalize();
                    const perp = new Vector3(dir.y, -dir.x, 0);
                    pp = p.clone();
                    const ang = d /120 * Math.PI;
                    p.add(perp.multiplyScalar(Math.cos(i) * this.waveWidth));
                }
            )
            const cp2 = createBezierCP2(this.bezierPoints);
            this.bezierPoints = cpToBezier(cp2, 8);
        }
    }

    updatePreviewObj() {
        if (!this.previewObj) {
            this.previewObj = new THREE.Object3D();
        }

        // HANDLES
        for (let i = this.handles.length; i < this.vertices.length; i ++) {
            const handle = this.createHandleObj();
            this.handles.push(handle);
            this.previewObj.add(handle);
        }
        for (let i = 0; i < this.handles.length; i ++) {
            if (i < this.vertices.length) {
                this.handles[i].position.copy(this.vertices[i]);
            } else {
                disposeObject(this.handles[i]);
                this.handles.pop();
            }
        }

        // LINE
        if (this.lineObj) {
            disposeObject(this.lineObj);
        }
        this.lineObj = line(this.vertices, 0x000000);
        this.previewObj.add(this.lineObj);
    }

    updateMainObj() {
        if (!this.mainObj) {
            const mainMaterial = this.getNewMaterial(this.context.selectedMaterial);
            this.mainObj = new THREE.Mesh(new THREE.BufferGeometry(), mainMaterial);
            this.mainObj.toolRef = this;
        }
        this.sides = stripSidesFromArray(this.bezierPoints, this.width);

        if (this.vertices.length > 1 && this.vertices[0].distanceTo(this.vertices[this.vertices.length - 1]) > 4) {
            this.mainObj.geometry.dispose();
            const data = stripGeomDataFromSides(this.sides)
            if (this.state == DraggableTool.states.CREATE) {
                this.initialPosition = { name: "initialPosition", data: data[0].data.slice(), stride: 3};
            }
            data.push(this.initialPosition);
            this.mainObj.geometry = dataToGeom(data);
        }

        const nSideLength = Math.min(this.sides[0].length, this.sides[1].length);

        this.updateMainUniforms();
    }
    
    pointerDown() {
        if (this.state != DraggableTool.states.CREATE) {
            return DraggableTool.results.END;
        }

        const pointer = this.data.context.pointer;
        const vp = v(pointer.x, pointer.y, 0);
        if (this.vertices[this.vertices.length - 2].distanceTo(vp) > 4) {
            this.vertices.push(vp);
            return DraggableTool.results.CONTINUE;
        } else {
            if (this.vertices.length > 2) {
                this.vertices.pop();
            }
            return DraggableTool.results.END;
        }
    }

    pointerUp() {
        if (this.state == DraggableTool.states.CREATE) {
            return DraggableTool.results.CONTINUE;
        } else {
            return DraggableTool.results.END;
        }
    }
}

