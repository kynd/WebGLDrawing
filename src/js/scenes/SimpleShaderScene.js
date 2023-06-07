import * as THREE from 'three';
import { SceneBase } from './SceneBase';

export class SimpleShaderScene extends SceneBase {
    constructor(context, fragPath) {
        super(context);
        this.scene = new THREE.Scene();
        this.fragPath = fragPath;
        this.setup();
    }

    async setupMain() {
        const vertexShaderSource = await this.loadShader('../shaders/common.vert');
        const fragmentShaderSource = await this.loadShader(this.fragPath);

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            uniforms: {
                res: { value: new THREE.Vector2(this.context.width, this.context.height)}
            }
        });

        const planeGeometry = new THREE.PlaneGeometry(this.context.width, this.context.height, 4, 4);
        this.planeObject = new THREE.Mesh(planeGeometry, this.material);
        this.scene.add( this.planeObject );
    }

    update() {
    }
}
