
import * as THREE from 'three';
import { loadText } from '../utils/FileUtil.js'

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
    
    static materials = {
        Experiment: {
            source: '../shaders/DrawingTools/experiment.frag',
            key: "1"
        },
        STRIPE_X: {
            source: '../shaders/DrawingTools/stripe.frag',
            key: "2",
            uniforms: {dir : 0}
        },
        STRIPE_Y: {
            source: '../shaders/DrawingTools/stripe.frag',
            key: "3",
            uniforms: {dir : 1}
        },
        GRADIENT: {
            source: '../shaders/DrawingTools/gradient.frag',
            key: "4"
        }
    }

    static vertexShaderSource = "";

    constructor(context) {
        this.context = context;
        this.vertices = [];
        this.handles = [];
        this.state = DraggableTool.states.CREATE;
    }

    static async initMaterials() {
        if (DraggableTool.vertexShaderSource) { return; }
        DraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        for (let key in DraggableTool.materials) {
            if (DraggableTool.materials.hasOwnProperty(key)) {
                const fragmentShaderSource = await loadText(DraggableTool.materials[key].source);
                DraggableTool.materials[key].source = fragmentShaderSource;
            }
        }
    }

    getNewMaterial(key) {
        const m = DraggableTool.materials[key];
        const material = new THREE.ShaderMaterial({
            vertexShader:  DraggableTool.vertexShaderSource,
            fragmentShader: m.source,
            transparent: true
        });
        if (m.uniforms) {
            for (let key in m.uniforms) {
                material.uniforms[key] = {value: m.uniforms[key]};
            }
        }
        return material;
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

    updateMainUniforms() {
        if (!this.colors) {
            this.colors = [...this.context.colorSelector.selectionColors];
        }

        const nSideLength = Math.min(this.sides[0].length, this.sides[1].length);

        const uniforms = this.mainObj.material.uniforms;
        uniforms.nSidePoints = {value: nSideLength};
        uniforms.maxSidePoints = {value: this.sideBufferLength};

        uniforms.canvasTexture = {value: this.data.canvasTexture};
        uniforms.referenceTexture = {value: this.data.referenceTexture};
        uniforms.sides = {value: this.sideTexture.texture};

        uniforms.c0 = {value: this.colors[0].toArray()};
        uniforms.c1 = {value: this.colors[1].toArray()};
        uniforms.c2 = {value: this.colors[2].toArray()};
        uniforms.c3 = {value: this.colors[3].toArray()};
        uniforms.res = { value: new THREE.Vector2(this.data.context.width, this.data.context.height)};
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