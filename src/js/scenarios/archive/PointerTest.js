import * as THREE from 'three';
import { ScenarioBase } from "../ScenarioBase.js";

export class PointerTest extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setup();
        this.start();
        this.pointerTarget = null;
        this.dragTarget = null;
        this.dragStartPointerCrd = null;
        this.dragStartObjectCrd = null;
    }

    setup() {
        const geometry = new THREE.BoxGeometry( 500, 500, 500 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        this.cube = new THREE.Mesh( geometry, material );
        this.scene = new THREE.Scene();
        this.scene.add(this.cube);
    }

    getPointerIntersects(pointer) {
        this.context.raycaster.setFromCamera(pointer, this.context.camera);
        const intersects = this.context.raycaster.intersectObject( this.scene, true );

        const res = [];
        if (intersects.length > 0) {
            return intersects.filter( (res)=> {
                return res && res.object;
            } )
        } else {
            return [];
        }
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
    }

    checkHover(evt) {
        const pointerCrd = this.getPointerCrdNormalized(evt);
        const res = this.getPointerIntersects(pointerCrd);
        if (res.length > 0 && res[0].object) {
            this.pointerTarget = res[0].object;
            this.pointerTarget.material.color.set( '#f00' );
        } else if (this.pointerTarget != null) {
            this.pointerTarget.material.color.set( '#fff' );
            this.pointerTarget = null;
        }
    }

    pointerDown(evt) {
        if (this.pointerTarget) {
            this.dragTarget = this.pointerTarget;
            this.dragStartPointerCrd = this.getPointerCrd(evt);
            this.dragStartObjectCrd = this.dragTarget.position.clone();
        }
        console.log("down");
    }

    pointerUp(evt) {
        this.dragTarget = null;
        console.log("up");
    }

    update() {
        this.context.renderer.render( this.scene, this.context.camera);
    }
}