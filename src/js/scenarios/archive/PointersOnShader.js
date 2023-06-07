import * as THREE from 'three';
import { ScenarioBase } from "../ScenarioBase.js";
import { v, line } from "../../utils/DrawingUtil.js"
import { SimpleShaderScene } from "../../scenes/SimpleShaderScene.js";

export class PointersOnShader extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setup();
        //this.start();
        this.pointerTarget = null;
        this.dragTarget = null;
        this.dragStartPointerCrd = null;
        this.dragStartObjectCrd = null;
        this.shaderScene = new SimpleShaderScene(this.context, '../shaders/image_warp.frag');
        const textureLoader = new THREE.TextureLoader();
        this.texture = textureLoader.load('../img/tiger.jpg');
        this.wait(()=>{
            return this.shaderScene.ready;
        }, ()=>{this.updateLine();console.log("init")})
    }

    setup() {
        this.scene = new THREE.Scene();
        const points = [v(0, 0, 0 ), v( 0, 0, 0 )];
        this.line = line(points, 0xFFFFFF);
        this.handles = [];
        this.handles.push(this.createHandle(-this.context.width / 4, -this.context.height / 8));
        this.handles.push(this.createHandle(this.context.width / 4, this.context.height / 8));
        this.scene.add(this.line);
    }

    createHandle(x, y) {
        const geometry = new THREE.CircleGeometry( 24, 32 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const handle = new THREE.Mesh( geometry, material );
        handle.position.x = x;
        handle.position.y = y;
        this.scene.add(handle);
        return handle;
    }

    updateLine() {
        const positions = this.line.geometry.attributes.position;
        for ( var i = 0; i < 2; i ++ ) {
            var x = positions.getX( i );
            var y = positions.getY( i );
            var z = positions.getZ( i );
        
            x = this.handles[i].position.x;
            y = this.handles[i].position.y;
            z = this.handles[i].position.z;
        
            positions.setXYZ( i, x, y, z );
            this.shaderScene.material.uniforms[`p${i}`] = { 
                value: new THREE.Vector2(this.handles[i].position.x  / this.context.height + 0.5, 
                    this.handles[i].position.y / this.context.height + 0.5)};
        }

        this.shaderScene.material.uniforms[`tex`] = { 
            value: this.texture};

        positions.needsUpdate = true;
    }

    pointerMove(evt) {
        if (this.dragTarget) {
            this.drag(evt);
        } else {
            this.checkHover(evt);
        }
    }

    drag(evt) {
        const currentPointerCrd = this.getPointerCrd(evt);
        const np = this.dragStartObjectCrd.clone();
        np.x += currentPointerCrd.x - this.dragStartPointerCrd.x;
        np.y += currentPointerCrd.y - this.dragStartPointerCrd.y;
        this.dragTarget.position.copy(np);

        this.updateLine();
    }

    checkHover(evt) {
        const pointerCrd = this.getPointerCrdNormalized(evt);
        const res = this.getPointerIntersects(pointerCrd);
        
        if (this.pointerTarget != null) {
            this.pointerTarget.material.color.set( '#fff' );
            this.pointerTarget = null;
        }

        if (res.length > 0 && res[0].object) {
            this.handles.forEach((handle)=>{
                if (handle == res[0].object) {
                    this.pointerTarget = handle;
                    this.pointerTarget.material.color.set( '#f00' );
                }
            })
        }
    }

    pointerDown(evt) {
        if (this.pointerTarget) {
            this.dragTarget = this.pointerTarget;
            this.dragStartPointerCrd = this.getPointerCrd(evt);
            this.dragStartObjectCrd = this.dragTarget.position.clone();
        }
    }

    pointerUp(evt) {
        this.dragTarget = null;
    }


    update() {
        this.context.renderer.render( this.shaderScene.scene, this.context.camera);
        this.context.renderer.autoClear = false;
        this.context.renderer.render( this.scene, this.context.camera);
        this.context.renderer.autoClear = true;
    }
}