
import * as THREE from 'three';

import { DraggableTool } from './DraggableTool.js';
import { v, line, disposeObject, createBezierCP, createBezierCP2, cpToBezier, stripSidesFromArray, stripFromSides} from "../utils/DrawingUtil.js"
import { loadText } from '../utils/FileUtil.js'
import { CyclePalette, palette01 } from '../utils/ColorUtil.js';
import { FloatDataTexture} from '../utils/FloatDataTexture.js';


export class StrokeDraggableTool extends DraggableTool {
    static ready = false;
    static async init() {
        StrokeDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        StrokeDraggableTool.fragmentShaderSource = await loadText('../shaders/StrokeDraggableTool/StrokeDraggableTool.frag');
        StrokeDraggableTool.palette = new CyclePalette(palette01);
        StrokeDraggableTool.ready = true;
    }

    constructor() {
        super();
        this.width = Math.random() * 200 + 60;
        this.sideBufferLength = 2048;
        this.sideTexture = new FloatDataTexture(null, this.sideBufferLength, 2);
        this.cA = this.constructor.palette.get();
        this.cB = this.constructor.palette.get();
        this.count = 0;
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

        // CENTER LINE
        if (this.lineObj) {
            disposeObject(this.lineObj);
        }

        this.lineObj = line(this.bezierPoints, 0x000000);
        this.previewObj.add(this.lineObj);
    }

    updateMainObj() {
        if (!this.mainObj) {
            const stripMaterial = new THREE.ShaderMaterial({
                vertexShader: this.constructor.vertexShaderSource,
                fragmentShader: this.constructor.fragmentShaderSource,
                uniforms: {
                    res: { value: new THREE.Vector2(this.data.context.width, this.data.context.height)},
                }
            });
            this.mainObj = new THREE.Mesh(new THREE.BufferGeometry(), stripMaterial);this.mainObj.toolRef = this;
        }
        this.sides = stripSidesFromArray(this.bezierPoints, this.width);

        if (this.vertices.length > 1 && this.vertices[0].distanceTo(this.vertices[this.vertices.length - 1]) > 4) {
            this.mainObj.geometry.dispose();
            this.mainObj.geometry = stripFromSides(this.sides)
        }

        const nSideLength = Math.min(this.sides[0].length, this.sides[1].length);

        if (this.state == DraggableTool.states.CREATE) {
            for (let i = 0; i < nSideLength; i ++) {
                this.sideTexture.setPixel(i, 0, [
                    this.sides[0][i].x, this.sides[0][i].y, 0, 1
                ]);
                this.sideTexture.setPixel(i, 1, [
                    this.sides[1][i].x, this.sides[1][i].y, 0, 1
                ]);
            }
            this.sideTexture.update();
        }
        
        if (nSideLength > this.sideBufferLength) {
            console.log(`WARNING: The strip has too many vertices (${nSideLength}). Keep it under ${this.sideBufferLength}` );
        }

        this.updateMainUniforms();
    }
    
    updateMainUniforms() {
        const uniforms = this.mainObj.material.uniforms;
        uniforms.cA = {value: new THREE.Color(this.cA).toArray()}
        uniforms.cB = {value: new THREE.Color(this.cB).toArray()}
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

    updateViewsAnimateCustom() {
        if (!this.origin) {
            this.saveOrigin();
        }
        this.count ++;
        const div = 60;
        const d = Math.floor(this.count / 60)
        const t = this.count / 60 - d;
        this.vertices.forEach((vertice, i)=> {
            const i0 = (d + i) % this.vertices.length;
            const i1 = (d + i + 1) % this.vertices.length;
            const v = this.verticeOrigins[i0].clone().lerp(this.verticeOrigins[i1], t);
            vertice.copy(v);
        });
    }

    disposeCustom() {
        if (this.sideTexture ) { this.sideTexture.dispose(); }
    }
}


export class StrokeSamplerDraggableTool extends StrokeDraggableTool {
    static ready = false;
    static async init() {
        StrokeSamplerDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        StrokeSamplerDraggableTool.fragmentShaderSource = await loadText('../shaders/StrokeDraggableTool/StrokeSamplerDraggableTool.frag');
        StrokeSamplerDraggableTool.ready = true;
    }

    updateMainUniforms() {
        const nSideLength = Math.min(this.sides[0].length, this.sides[1].length);

        const uniforms = this.mainObj.material.uniforms;
        uniforms.nSidePoints = {value: nSideLength};
        uniforms.offset = {value: (this.count % 360) / 360};
        uniforms.maxSidePoints = {value: this.sideBufferLength};
        uniforms.canvasTexture = {value: this.data.canvasTexture};
        uniforms.referenceTexture = {value: this.data.referenceTexture};
        uniforms.sides = {value: this.sideTexture.texture};
    }

    updateViewsAnimateCustom() {
        if (!this.origin) {
            this.saveOrigin();
        }
        this.count ++;
    }
}

export class StrokeStripeSamplerDraggableTool extends StrokeDraggableTool {
    static ready = false;
    static async init() {
        StrokeStripeSamplerDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        StrokeStripeSamplerDraggableTool.fragmentShaderSource = await loadText('../shaders/StrokeDraggableTool/StrokeStripeSamplerDraggableTool.frag');
        StrokeStripeSamplerDraggableTool.ready = true;
    }

    updateMainUniforms() {
        const nSideLength = Math.min(this.sides[0].length, this.sides[1].length);

        const uniforms = this.mainObj.material.uniforms;
        uniforms.nSidePoints = {value: nSideLength};
        uniforms.maxSidePoints = {value: this.sideBufferLength};
        uniforms.canvasTexture = {value: this.data.canvasTexture};
        uniforms.referenceTexture = {value: this.data.referenceTexture};
        uniforms.sides = {value: this.sideTexture.texture};
    }
}

export class StrokeStripeDraggableTool extends StrokeDraggableTool {
    static ready = false;
    static async init() {
        StrokeStripeDraggableTool.vertexShaderSource = await loadText('../shaders/common.vert');
        StrokeStripeDraggableTool.fragmentShaderSource = await loadText('../shaders/StrokeDraggableTool/StrokeStripeDraggableTool.frag');
        StrokeStripeDraggableTool.palette = new CyclePalette(palette01);
        StrokeStripeDraggableTool.ready = true;
    }

    updateMainUniforms() {
        if (!this.colors) {
            this.colors = this.data.colors;
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
    }
}