
import * as THREE from 'three';

import { DraggableTool } from './DraggableTool.js';
import { v, line, disposeObject, createBezierCP, cpToBezier, stripSidesFromArray} from "../utils/DrawingUtil.js"

import { blobGeomDataFromVertices, dataToGeom} from "../utils/GeomUtil.js"

export class BlobDraggableTool extends DraggableTool {
    static ready = false;
    static async init() {
        await DraggableTool.initMaterials();
        BlobDraggableTool.ready = true;
    }

    constructor(context) {
        super(context);
        this.width = Math.random() * 200 + 60;
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
            const cp = createBezierCP(this.vertices);
            this.bezierPoints = cpToBezier(cp);
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

        const vts = [...this.vertices, this.vertices[0]];
        this.lineObj = line(vts, 0x000000);
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
            const data = blobGeomDataFromVertices(this.vertices)
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

