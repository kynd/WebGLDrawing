import * as THREE from 'three';
import { SceneBase } from './SceneBase';
import { line, v } from "../utils/DrawingUtil.js";
import { loadText } from '../utils/FileUtil';

export class TestScene01 extends SceneBase {
    constructor(context) {
        super(context);
        this.scene = new THREE.Scene();
        this.setup();
    }

    setupMain() {
        const geometry = new THREE.PlaneGeometry( 500, 500, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new THREE.Mesh( geometry, material );
        this.scene.add( this.cube);
    }

    update() {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }
}

export class TestScene02  extends SceneBase {
    constructor(context, renderTarget) {
        super(context);
        this.renderTarget = renderTarget;
        this.scene = new THREE.Scene();
        this.setup();
    }
    
    async setupMain() {
        const vertexShaderSource = await loadText('../shaders/common.vert');
        const fragmentShaderSource = await loadText('../shaders/test.frag');

        const planeMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            uniforms: {
                tex: { value: this.renderTarget.texture }
            }
        });

        const planeGeometry = new THREE.PlaneGeometry(this.context.width, this.context.height, 4, 4);
        const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
        this.scene.add( planeObject );

        const points = [v( - 500, 0, 0 ), v( 0, 500, 0 ), v( 500, 0, 0 )];
        this.scene.add( line(points, 0xffffff) );
    }

    update() {
    }
}