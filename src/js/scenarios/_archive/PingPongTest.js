import * as THREE from 'three';
import { ScenarioBase } from "../ScenarioBase.js";
import { TestScene01, TestScene02 } from "../../scenes/TestScenes.js"
import { SimpleShaderScene } from "../../scenes/SimpleShaderScene.js"
import { PingPong } from "../../scenes/PingPong.js"

export class PingPongTest extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setup();
    }

    setup() {
        this.renderTarget = new THREE.WebGLRenderTarget(this.context.width, this.context.height, { format: THREE.RGBAFormat, type: THREE.FloatType });

        this.shaderScene = new SimpleShaderScene(this.context, '../shaders/checker.frag')
        this.pingPong = new PingPong(this.context, '../shaders/slide.frag');
        this.testScene = new TestScene01(this.context);

        this.wait(()=> { return this.pingPong.ready && this.shaderScene.ready; })
    }

    update() {
        if (this.context.frameCount == 0) {
            this.pingPong.renderOnCurrentRenderTarget(this.shaderScene.scene);
        }
        this.pingPong.update();

        this.context.renderer.render( this.pingPong.scene, this.context.camera);
    }
}