import * as THREE from 'three';
import { ScenarioBase } from "../ScenarioBase.js";
import { createDataTextureFromArray, arrayToF32 } from "../../utils/DrawingUtil.js"

export class DataTextureTest extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1080);
        this.createDataTexture();
        this.setup();
        this.start();
    }

    createDataTexture() {
        const width = 4;
        const height = 4;
        const arr = [];

        for (let i = 0; i < height; i ++) {
            const row = [];
            for (let j = 0; j < width; j ++) {
                const v = new Array(4);
                v[0] = i / (height - 1);
                v[1] = j / (width - 1);
                v[2] = 0;
                v[3] = 1;
                row.push(v);
            }
            arr.push(row);
        }
        this.texture = createDataTextureFromArray(arr);
    }

    updateDataTexture() {
        const width = 4;
        const height = 4;
        const arr = [];

        for (let i = 0; i < height; i ++) {
            const row = [];
            for (let j = 0; j < width; j ++) {
                const v = new Array(4);
                v[0] = i / (height - 1);
                v[1] = j / (width - 1);
                v[2] = Math.random();
                v[3] = 1;
                row.push(v);
            }
            arr.push(row);
        }
        this.texture.image.data.set(arrayToF32(arr));
        this.texture.needsUpdate = true;
    }

    setup() {
        this.scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry( 500, 500, 1 );
        const material = new THREE.MeshBasicMaterial( { map: this.texture } );
        this.obj = new THREE.Mesh( geometry, material );
        this.scene.add(this.obj);
    }

    update() {
        this.updateDataTexture();
        this.context.renderer.render( this.scene, this.context.camera);
    }
}