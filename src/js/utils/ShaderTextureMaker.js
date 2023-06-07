import { loadText } from './FileUtil';
import * as THREE from 'three';

export class ShaderTextureMaker {
    constructor(w, h, shaderPath, context) {
        this.context = context;
        this.width = w;
        this.height = h;
        this.ready = false;
        this.shaderPath = shaderPath;
        this.setup();
    }

    async setup() {
        this.scene = new THREE.Scene();

        // Camera
        const fov = 65;
        const hFovRadian = fov / 2 / 180 * Math.PI;
        const cz = this.height / 2 / Math.tan(hFovRadian);
        this.camera = new THREE.PerspectiveCamera(fov, this.width/this.height, 0.1, cz * 2 );
        this.camera.position.z = cz;
        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {  format: THREE.RGBAFormat, type: THREE.FloatType });

        this.vertexShaderSource = await loadText('../shaders/common.vert');
        this.fragmentShaderSource = await loadText(this.shaderPath);

        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            vertexShader: this.vertexShaderSource,
            fragmentShader: this.fragmentShaderSource,
            uniforms: {
                res: { value: new THREE.Vector2(this.width, this.height)},
            }
        });
        const geometry = new THREE.PlaneGeometry(this.width, this.height, 4, 4);
        this.obj = new THREE.Mesh(geometry, material);
        this.scene.add(this.obj);
        this.ready = true;
    }

    getMaterial() {
        return this.obj.material;
    }

    update() {
        this.context.renderer.setRenderTarget( this.renderTarget );
        this.context.renderer.setClearColor(0x000000, 1);
        this.context.renderer.clear();
        this.context.renderer.render( this.scene, this.camera );
        this.context.renderer.setRenderTarget( null );
    }
}