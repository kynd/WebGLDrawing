import * as THREE from 'three';
import { ScenarioBase } from "../ScenarioBase.js";
import { TestScene01, TestScene02 } from "../../scenes/TestScenes.js"

export class TestScenario extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1080);
        this.setup();
        this.start();
    }

    setup() {
        this.renderTarget = new THREE.WebGLRenderTarget(this.context.width, this.context.height, { format: THREE.RGBAFormat, 
            type: THREE.FloatType });
        this.mainScene = new TestScene02(this.context, this.renderTarget);
        this.testScene = new TestScene01(this.context);
    }

    update() {
        this.testScene.update();
        this.mainScene.update();
        this.context.renderer.setRenderTarget(this.renderTarget);
        this.context.renderer.render( this.testScene.scene, this.context.camera);

        this.context.renderer.setRenderTarget(null);
        this.context.renderer.render( this.mainScene.scene, this.context.camera);
    }
}