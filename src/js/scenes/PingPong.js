import * as THREE from 'three';
import { SceneBase } from './SceneBase';
import { loadText } from '../utils/FileUtil';

export class PingPong extends SceneBase {
    constructor(context, fragPath) {
        super(context);
        this.fragPath = fragPath;
        this.setup();
    }

    getCurrentRenderTarget() {
        return this.renderTargets[this.pingpongIndex];
    }

    getCopyRenderTarget() {
        if (this.copyRenderTargetNeedsUpdate) {
            this.copyPlaneObject.material.uniforms.tex.value = this.getCurrentRenderTarget().texture;
            this.context.renderer.setRenderTarget(this.copyRenderTarget);
            this.context.renderer.autoClear = false;
            this.context.renderer.render( this.copyScene, this.context.camera);
            this.context.renderer.autoClear = true;
            this.context.renderer.setRenderTarget(null);
            this.copyRenderTargetNeedsUpdate = false;
        }
        return this.copyRenderTarget;
    }

    async setupMain() {
        const vertexShaderSource = await loadText('../shaders/common.vert');
        const fragmentShaderSource = await loadText(this.fragPath);
        const copyFragmentShaderSource = await loadText('../shaders/simple_image.frag');

        // Render targets

        this.renderTargets = [];
        this.renderTargets.push(new THREE.WebGLRenderTarget(this.context.width, this.context.height, { format: THREE.RGBAFormat, type: THREE.FloatType }));
        this.renderTargets.push(new THREE.WebGLRenderTarget(this.context.width, this.context.height, { format: THREE.RGBAFormat, type: THREE.FloatType }));

        this.copyRenderTarget = new THREE.WebGLRenderTarget(this.context.width, this.context.height, { format: THREE.RGBAFormat, type: THREE.FloatType });

        this.pingpongIndex = 0;

        // Main Scene
        this.scene = new THREE.Scene();
        const planeMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            uniforms: {
                res: { value: new THREE.Vector2(this.context.width, this.context.height)},
                tex: { value: this.renderTargets[0].texture }
            }
        });

        const planeGeometry = new THREE.PlaneGeometry(this.context.width, this.context.height, 4, 4);
        this.planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
        this.scene.add( this.planeObject );

        // Copy Scene
        this.copyScene = new THREE.Scene();
        const copyPlaneMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: copyFragmentShaderSource,
            uniforms: {
                res: { value: new THREE.Vector2(this.context.width, this.context.height)},
                tex: { value: this.renderTargets[0].texture }
            }
        });
        const copyPlaneGeometry = new THREE.PlaneGeometry(this.context.width, this.context.height, 4, 4);
        this.copyPlaneObject = new THREE.Mesh(copyPlaneGeometry, copyPlaneMaterial);
        this.copyScene.add( this.copyPlaneObject );
    }

    renderOnCurrentRenderTarget(scene) {
        this.context.renderer.autoClear = false;
        this.context.renderer.setRenderTarget(this.getCurrentRenderTarget());
        this.context.renderer.render( scene, this.context.camera);
        this.context.renderer.setRenderTarget(null);
        this.context.renderer.autoClear = true;
    }

    update() {
        if (!this.ready) { return; }
        const iA = this.pingpongIndex;
        const iB = (this.pingpongIndex + 1) % 2;
        this.planeObject.material.uniforms.tex.value = this.renderTargets[iA].texture;
        this.context.renderer.setRenderTarget(this.renderTargets[iB]);
        this.context.renderer.autoClear = false;
        this.context.renderer.render( this.scene, this.context.camera);
        this.context.renderer.autoClear = true;
        this.context.renderer.setRenderTarget(null);

        this.pingpongIndex = iB;
        this.copyRenderTargetNeedsUpdate = true;
    }
}
