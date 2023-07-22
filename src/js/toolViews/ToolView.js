
import * as THREE from 'three';
import { disposeObject } from "../utils/GeomUtil.js"
import { loadText } from '../utils/FileUtil.js'

export class ToolView {
    static ready = false;
    static vertexShaderSource = "";

    static materials = {
        SAMPLE_HEX: {
            src: '../shaders/DrawingTools/sample_hex.frag',
            key: "1"
        },
        FLAT: {
            src: '../shaders/DrawingTools/flat.frag',
            key: "2"
        },
        STRIPE_X: {
            src: '../shaders/DrawingTools/stripe.frag',
            key: "3",
            uniforms: {dir : 0}
        },
        STRIPE_Y: {
            src: '../shaders/DrawingTools/stripe.frag',
            key: "4",
            uniforms: {dir : 1}
        },
        GRADIENT: {
            src: '../shaders/DrawingTools/gradient.frag',
            key: "5"
        },
        SAMPLE: {
            src: '../shaders/DrawingTools/sample.frag',
            key: "6"
        },
        SAMPLE_CANVAS: {
            src: '../shaders/DrawingTools/sample_canvas.frag',
            key: "7"
        }
    }

    constructor(context) {
        this.context = context;
        this.vertices = [];
        this.colors = Array.from({ length: 4 }, () => new THREE.Color(0, 0, 0));
        this.isInitialCoordInSync = true;
        const mainMaterial = this.getNewMaterial(this.context.selectedMaterial);
        this.viewObj = new THREE.Mesh(new THREE.BufferGeometry(), mainMaterial);
    }

    static async initMaterials() {
        if (ToolView.ready) { return; }
        ToolView.vertexShaderSource = await loadText('../shaders/DrawingTools/drawing.vert');
        for (let key in ToolView.materials) {
            if (ToolView.materials.hasOwnProperty(key)) {
                const fragmentShaderSource = await loadText(ToolView.materials[key].src);
                ToolView.materials[key].source = fragmentShaderSource;
            }
        }
        ToolView.ready = true;
    }

    getNewMaterial(key) {
        const m = ToolView.materials[key];
        const material = new THREE.ShaderMaterial({
            vertexShader:  ToolView.vertexShaderSource,
            fragmentShader: m.source,
            transparent: true,
            side: THREE.DoubleSide
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
        this.updateView();
        this.updateUniforms();
    }

    updateUniforms() {
        const uniforms = this.viewObj.material.uniforms;
        uniforms.canvasTexture = {value: this.data.canvasTexture};
        uniforms.referenceTexture = {value: this.data.referenceTexture};

        uniforms.c0 = {value: this.colors[0].toArray()};
        uniforms.c1 = {value: this.colors[1].toArray()};
        uniforms.c2 = {value: this.colors[2].toArray()};
        uniforms.c3 = {value: this.colors[3].toArray()};
        uniforms.res = { value: new THREE.Vector2(this.data.context.width, this.data.context.height)};
    }

    updateView() {
        // Override 
    }

    dispose() {
        if (this.viewObj) { disposeObject(this.viewObj); }
    }
}