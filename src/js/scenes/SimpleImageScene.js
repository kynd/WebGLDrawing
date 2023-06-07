import * as THREE from 'three';
import { SceneBase } from './SceneBase';
import { loadText } from '../utils/FileUtil';

export class SimpleImageScene extends SceneBase {
    constructor(context, imagePath) {
        super(context);
        this.scene = new THREE.Scene();
        this.imagePath = imagePath;

        this.setup();
    }


    async setup() {
        console.log("setup is overridden")
        await this.setupMain();
    }

    async setupMain() {
        const vertexShaderSource = await loadText('../shaders/common.vert');
        const fragmentShaderSource = await loadText('../shaders/simple_image.frag');


        const textureLoader = new THREE.TextureLoader();
        this.texture = await textureLoader.load(this.imagePath, 
            (texture)=> {
                console.log(this)
                this.planeObject.material.uniforms.tex = {value: this.texture}
                // This callback function will be called once the image is loaded and set as the texture's image.
                console.log('Texture loaded successfully!');
                this.ready = true;
              }, undefined, function(error) {
                // This callback function will be called if there is an error loading the image.
                console.error('Error loading texture: ', error);
              });

        this.material = new THREE.MeshBasicMaterial({color: 0xff0000})
        
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            uniforms: {
                res: { value: new THREE.Vector2(this.context.width, this.context.height)},
                tex: this.texture
            }
        });

        const planeGeometry = new THREE.PlaneGeometry(this.context.width, this.context.height, 4, 4);
        this.planeObject = new THREE.Mesh(planeGeometry, this.material);
        this.scene.add( this.planeObject );
    }

    update() {
    }
}
