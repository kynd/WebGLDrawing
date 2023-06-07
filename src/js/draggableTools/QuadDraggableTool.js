
import * as THREE from 'three';
import { DraggableTool } from './DraggableTool.js';
import { v, line, disposeObject, quadFromCorners} from "../utils/DrawingUtil.js"
import { loadText } from '../utils/FileUtil.js'
import { CyclePalette, palette01 } from '../utils/ColorUtil.js';

export class QuadDraggableTool extends DraggableTool {
    static ready = false;
    static async init() {
        QuadDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        QuadDraggableTool.fragmentShaderSource = await loadText('../shaders/QuadDraggableTool/QuadDraggableTool.frag');
        QuadDraggableTool.palette = new CyclePalette(palette01);
        QuadDraggableTool.ready = true;
    }

    constructor() {
        super();
        this.count = 0;
        this.cA = this.constructor.palette.get();
        this.cB = this.constructor.palette.get();
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
            const mainMaterial = new THREE.ShaderMaterial({
                depthTest: false,
                transparent: true,
                side: THREE.DoubleSide,
                vertexShader: this.constructor.vertexShaderSource,
                fragmentShader: this.constructor.fragmentShaderSource,
                uniforms: {
                    res: { value: new THREE.Vector2(this.data.context.width, this.data.context.height)},
                }
            });
            this.mainObj = new THREE.Mesh(new THREE.BufferGeometry(), mainMaterial);
            this.mainObj.toolRef = this;
        } else {
            this.mainObj.geometry.dispose();
        }

        const mainGeometry = quadFromCorners(this.vertices);
        this.mainObj.geometry = mainGeometry;

        this.updataMainUniforms();
    }

    updataMainUniforms() {
        const uniforms = this.mainObj.material.uniforms;
        uniforms.cA = {value: new THREE.Color(this.cA).toArray()}
        uniforms.cB = {value: new THREE.Color(this.cB).toArray()}
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

export class QuadSamplerDraggableTool extends QuadDraggableTool {
    static ready = false;
    static async init() {
        QuadSamplerDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        QuadSamplerDraggableTool.fragmentShaderSource = await loadText('../shaders/QuadDraggableTool/QuadSamplerDraggableTool.frag');
        QuadSamplerDraggableTool.ready = true;
    }
    
    updataMainUniforms() {
        const uniforms = this.mainObj.material.uniforms;
        uniforms.canvasTexture = {value: this.canvasTexture};
        uniforms.referenceTexture = {value: this.data.referenceTexture};
        uniforms.pA = {value: this.pA.toArray() };
        uniforms.pB = {value: this.pB.toArray() };
        uniforms.offset = {value: (this.count % 360) / 360};
    }

    updateViewsAnimateCustom() {
        if (!this.origin) {
            this.saveOrigin();
        }
        this.count ++;
    }
}

export class QuadStripeSamplerDraggableTool extends QuadDraggableTool {
    static ready = false;
    static async init() {
        QuadStripeSamplerDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        QuadStripeSamplerDraggableTool.fragmentShaderSource = await loadText('../shaders/QuadDraggableTool/QuadStripeSamplerDraggableTool.frag');
        QuadStripeSamplerDraggableTool.ready = true;
    }
    
    updataMainUniforms() {
        const uniforms = this.mainObj.material.uniforms;
        uniforms.canvasTexture = {value: this.canvasTexture};
        uniforms.referenceTexture = {value: this.data.referenceTexture};
        uniforms.pA = {value: this.pA.toArray() };
        uniforms.pB = {value: this.pB.toArray() };
    }
}

export class QuadStripeDraggableTool extends QuadDraggableTool {
    static ready = false;
    static async init() {
        QuadStripeDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        QuadStripeDraggableTool.fragmentShaderSource = await loadText('../shaders/QuadDraggableTool/QuadStripeDraggableTool.frag');
        QuadStripeDraggableTool.palette = new CyclePalette(palette01);
        QuadStripeDraggableTool.ready = true;
    }
    
    updataMainUniforms() {
        if (!this.colors) {
            this.colors = this.data.colors;
        }

        const uniforms = this.mainObj.material.uniforms;
        uniforms.canvasTexture = {value: this.canvasTexture};
        uniforms.referenceTexture = {value: this.data.referenceTexture};
        uniforms.pA = {value: this.pA.toArray() };
        uniforms.pB = {value: this.pB.toArray() };
        uniforms.c0 = {value: this.colors[0].toArray()};
        uniforms.c1 = {value: this.colors[1].toArray()};
        uniforms.c2 = {value: this.colors[2].toArray()};
        uniforms.c3 = {value: this.colors[3].toArray()};
    }
}