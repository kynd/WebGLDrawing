import * as THREE from 'three';
import { v, line } from "../utils/DrawingUtil.js"
import { disposeObject } from "../utils/GeomUtil.js"

export class ToolAutoControl {

    static states = {
        ACTIVE: 1,
        DONE: 2,
        DISPOSE: 3
    };

    constructor(context, view) {
        this.view = view;
        this.context = context;
        this.state = ToolAutoControl.states.ACTIVE;
        this.previewObj = new THREE.Object3D();
        this.handles = [];
        this.lines = [];
        this.vertices = [];
        this.isLoop = false;

        this.vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        
    }

    getPreviewObj() {
        return this.previewObj;
    }

    getMainObj() {
        return this.view.viewObj;
    }

    update(data) {
        this.data = data;
        this.updateCommon();
        switch (this.state) {
            case ToolAutoControl.states.ACTIVE: 
            this.updateActive();
            break;
            default:
                return;
        }

        this.updatePreviewObj();
        this.view.vertices = this.vertices;
        this.view.update(this.data);
    }

    updateCommon() {
    }

    updateActive() {
        this.vertices.forEach((v) => {
            v.x = (Math.random() - 0.5) * 1000;
            v.y = (Math.random() - 0.5) * 1000;
        });
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
            const p0 = this.vertices[i0];
            const p1 = this.vertices[i1];
            positions.setXYZ( 0, p0.x, p0.y, p0.z );
            positions.setXYZ( 1, p1.x, p1.y, p1.z );
            positions.needsUpdate = true;
        }
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
}
