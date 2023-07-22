import * as THREE from 'three';
import { v, line } from "../utils/DrawingUtil.js"
import { disposeObject } from "../utils/GeomUtil.js"

export class ToolControl {

    static states = {
        CREATE: 1 ,
        EDIT: 2,
        MOVE: 3,
        STANDBY: 4,
        IDLE: 5,
        DISPOSE: 6
    };

    /*
    static results = {
        END: 1,
        CONTINUE: 2,
        ABANDON: 3
    }
    */
   
    constructor(context, view) {
        this.view = view;
        this.view.viewObj.toolRef = this;
        this.context = context;
        this.state = ToolControl.states.CREATE;
        this.previewObj = new THREE.Object3D();
        this.handles = [];
        this.lines = [];
        this.vertices = [];
        this.isLoop = false;
    }

    getPreviewObj() {
        return this.previewObj;
    }

    getMainObj() {
        return this.view.viewObj;
    }

    update(data) {
        this.data = data;
        if (!this.origin) { this.origin = this.data.context.pointer; }

        this.updateCommon();
        switch (this.state) {
            case ToolControl.states.CREATE: 
            this.updateCreate();
            break;
            case ToolControl.states.EDIT: 
            this.updateEdit();
            break;
            case ToolControl.states.MOVE: 
            this.updateMove();
            break;
            case ToolControl.states.IDLE:
            case ToolControl.states.STANDBY:
            case ToolControl.states.DISPOSE:
                return // do nothing
        }

        this.updatePreviewObj();
        this.view.vertices = this.vertices;
        this.view.update(this.data);
    }

    saveOrigin() {
        this.origin = this.data.context.pointer;
        this.verticeOrigins = this.vertices.map(vector => vector.clone());
    }

    updateCommon() {
        if (this.state == ToolControl.states.CREATE) {
            this.view.colors = [...this.context.colorSelector.selectionColors];
            this.view.toolParams = JSON.parse(JSON.stringify(this.data.toolParams))
        } else {
            this.view.isInitialCoordInSync = false;
        }
    }

    updateCreate() {
        // Override
    }

    updateMove() {
        const pointer = this.data.context.pointer;
        const tx = pointer.x - this.origin.x;
        const ty = pointer.y - this.origin.y;

        this.vertices.forEach((v, i)=>{
            v.x = this.verticeOrigins[i].x + tx;
            v.y = this.verticeOrigins[i].y + ty;
        });
    }

    updateEdit() {
        const pointer = this.data.context.pointer;
        const tx = pointer.x - this.origin.x;
        const ty = pointer.y - this.origin.y;
        const idx = this.dragVerticeIndex;
        this.vertices[idx].x = this.verticeOrigins[idx].x + tx;
        this.vertices[idx].y = this.verticeOrigins[idx].y + ty;
    }

    updatePreviewObj() {
        while (this.handles.length < this.vertices.length) {
            const handle = this.createHandleObj();
            this.previewObj.add(handle);
            this.handles.push(handle);
        }
        
        for (let i = 0; i < this.handles.length; i ++) {
            const p = this.vertices[i];
            this.handles[i].position.copy(p);
        }

        const n = this.isLoop ? 0 : -1;

        while (this.lines.length < this.vertices.length + n) {
            const l = line([v(0,0,0), v(0,0,0)], 0x000000);
            this.previewObj.add(l);
            this.lines.push(l);
        }

        for (let i = 0; i < this.lines.length; i ++) {
            const positions = this.lines[i].geometry.attributes.position;
            const i0 = i % this.vertices.length;
            const i1 = (i + 1) % this.vertices.length;
            const p0 = this.vertices[i];
            const p1 = this.vertices[i1];
            positions.setXYZ( 0, p0.x, p0.y, p0.z );
            positions.setXYZ( 1, p1.x, p1.y, p1.z );
            positions.needsUpdate = true;
        }
    }

    startDrag(object) {
        this.saveOrigin();
        this.previewObj.visible = true;
        if (object == this.view.viewObj) {
            console.log("MOVE")
            this.state = ToolControl.states.MOVE;
        } else {
            this.handles.forEach((handle, i) => {
                console.log("EDIT")
                if (object == handle) {
                    this.state = ToolControl.states.EDIT;
                    this.dragVerticeIndex = i;
                }
            })
        }
    }

    endSelection() {
        this.saveOrigin();
        this.state = ToolControl.states.IDLE;
        this.previewObj.visible = false;
    }

    pointerDown() {
        // Override
    }

    pointerUp() {
        // Override
    }

    dispose() {
        if (this.previewObj) { disposeObject(this.previewObj); }
        if (this.view) { this.view.dispose(); }
    }

    createHandleObj() {
        const cornerGeometry = new THREE.PlaneGeometry(24, 24, 2, 2);
        const cornerMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        const handle = new THREE.Mesh(cornerGeometry, cornerMaterial);
        handle.toolRef = this;
        return handle;
    }

    moveDistance() {
        const x0 = this.data.context.pointer.x;
        const y0 = this.data.context.pointer.y;
        const x1 = this.origin.x;
        const y1 = this.origin.y;
        return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
    }
}
