
import * as THREE from 'three';

import { DraggableTool } from './DraggableTool.js';
import { v, line, createBezierCP2, cpToBezier, stripSidesFromArray} from "../utils/DrawingUtil.js"
import { disposeObject } from "../../utils/GeomUtil.js"
import { stripGeomDataFromSides, dataToGeom} from "../utils/GeomUtil.js"


export class SpiralDraggableTool extends DraggableTool {
    static ready = false;
    static async init() {
        await DraggableTool.initMaterials();
        SpiralDraggableTool.ready = true;
    }

    constructor(context) {
        super(context);
        this.width = 30;
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
                    pp = p.clone();
                    const ang = d / 360 * Math.PI;
                    p.x += Math.cos(i) * 128;
                    p.y += Math.sin(i) * 128;
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

