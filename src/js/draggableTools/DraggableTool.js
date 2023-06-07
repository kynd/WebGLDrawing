
import * as THREE from 'three';

export class DraggableTool {
    static states = {
        CREATE: 1 ,
        EDIT: 2,
        MOVE: 3,
        IDLE: 4
    };
    static results = {
        END: 1,
        CONTINUE: 2,
        ABANDON: 3
    }

    constructor() {
        this.vertices = [];
        this.handles = [];
        this.state = DraggableTool.states.CREATE;
    }

    update(data) {
        this.data = data;
        switch (this.state) {
            case DraggableTool.states.CREATE: 
            this.updateViewsCreate();
            break;
            case DraggableTool.states.EDIT: 
            this.updateViewsEdit();
            break;
            case DraggableTool.states.MOVE: 
            this.updateViewsMove();
            break;
            case DraggableTool.states.IDLE: 
            this.updateViewsAnimate();
        }
    }

    saveOrigin() {
        this.origin = this.data.context.pointer;
        this.verticeOrigins = this.vertices.map(vector => vector.clone());
    }

    updateViewsCreate() {
        this.updateViewsCreateCustom();
        this.updateObjects();
    }

    updateViewsMove() {
        const pointer = this.data.context.pointer;
        const tx = pointer.x - this.origin.x;
        const ty = pointer.y - this.origin.y;

        this.vertices.forEach((v, i)=>{
            v.x = this.verticeOrigins[i].x + tx;
            v.y = this.verticeOrigins[i].y + ty;
        });
        this.updateViewsMoveCustom();
        this.updateObjects();
    }

    updateViewsEdit() {
        const pointer = this.data.context.pointer;
        const tx = pointer.x - this.origin.x;
        const ty = pointer.y - this.origin.y;
        const idx = this.dragVerticeIndex;
        this.vertices[idx].x = this.verticeOrigins[idx].x + tx;
        this.vertices[idx].y = this.verticeOrigins[idx].y + ty;
        this.updateViewsMoveCustom();
        this.updateObjects();
    }

    startAnimation() {
        this.saveOrigin();
    }

    updateViewsAnimate() {
        this.updateViewsAnimateCustom();
        this.updateObjects();
    }
    
    updateViewsCreateCustom() {}
    updateViewsMoveCustom() {}
    updateViewsEditCustom() {}
    updateViewsAnimateCustom() {}

    updateObjects() {
        this.updateObjectsCommon();
        this.updatePreviewObj();
        this.updateMainObj();
    }

    updateObjectsCommon(){}
    updatePreviewObj(){}
    updateMainObj(){}

    startDrag(object) {
        this.saveOrigin();
        if (object == this.mainObj) {
            this.state = DraggableTool.states.MOVE;
        } else {
            this.handles.forEach((handle, i) => {
                if (object == handle) {
                    this.state = DraggableTool.states.EDIT;
                    this.dragVerticeIndex = i;
                }
            })
        }
    }

    endDrag() {
        this.saveOrigin();
        this.state = DraggableTool.states.IDLE;
    }

    dispose() {
        if (this.previewObj) { disposeObject(this.previewObj); }
        if (this.mainObj) { disposeObject(this.mainObj); }
        this.disposeCustom();
    }

    disposeCustom() {};

    createHandleObj() {
        const cornerGeometry = new THREE.PlaneGeometry(24, 24, 2, 2);
        const cornerMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        const handle = new THREE.Mesh(cornerGeometry, cornerMaterial);
        handle.toolRef = this;
        return handle;
    }
}