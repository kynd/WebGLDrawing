import $ from "jquery"
import * as THREE from 'three';
import { saveObjAsJson, loadJsonAsObj, saveCanvasImage, ImageSequenceSaver } from "../utils/FileUtil.js";

export class ScenarioBase {
    constructor() {
        this.paused = true;
        this.animate();
    }

    setupContext(w, h) {
        this.context = {};
        this.context.frameCount = 0;
        // Canvas Size
        this.context.width = w;
        this.context.height = h;

        // Camera
        const fov = 65;
        const hFovRadian = fov / 2 / 180 * Math.PI;
        const cz = this.context.height / 2 / Math.tan(hFovRadian);
        this.context.camera = new THREE.PerspectiveCamera(fov, this.context.width/this.context.height, 0.1, cz * 2 );
        this.context.camera.position.z = cz;

        // Renderers
        this.context.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
        this.context.renderer.setSize( this.context.width, this.context.height );
        this.context.canvasElm = this.context.renderer.domElement;
        this.context.canvas = $(this.context.canvasElm);
        $('#main').append(this.context.canvas);
        $('#main').css({width: this.context.width * 0.5, height: this.context.height * 0.5});

        // Misc
		this.context.raycaster = new THREE.Raycaster();

        $(document).on("pointermove", this._pointerMove.bind(this));
        $(this.context.canvas).on("pointerdown", this._pointerDown.bind(this));
        $(document).on("pointerup", this._pointerUp.bind(this));

        let gl = this.context.renderer.getContext();
        const maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        const maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        console.log(maxVertexUniformVectors, maxFragmentUniformVectors)
    }

    _pointerMove(evt){ if (!this.paused) {this.pointerMove(evt);} }
    _pointerDown(evt){ if (!this.paused) {this.pointerDown(evt);} }
    _pointerUp(evt){ if (!this.paused) {this.pointerUp(evt);} }

    pointerMove(evt){}
    pointerDown(evt){}
    pointerUp(evt){}

    wait (func, init = ()=>{}) {
        if (func()) {
            init();
            this.paused = false;
        } else {
            requestAnimationFrame( ()=>{this.wait(func, init)} );
        }
    }

    start () {
        this.paused = false;
    }

    animate() {
        if (!this.paused) {
            this.update();
            this.context.frameCount ++;
        }
        requestAnimationFrame( this.animate.bind(this) );
    }

    update() {}

    async saveCanvasImage() {
        this.paused = true;
        await saveCanvasImage(this.context.canvasElm);
        this.paused = false;
    }

    // ------------------

    async saveCanvasImageSequence() {
        this.paused = true;
        if (!this.imageSaver) {
            this.imageSaver = new ImageSequenceSaver();
            await this.imageSaver.showDirectoryPicker();
        }
        console.log("saving")
        await this.imageSaver.saveCanvasImage(this.context.canvasElm);
        
        this.paused = false;
    }

    async saveObjAsJson(obj) {
        this.paused = true;
        await saveObjAsJson(obj);
        this.paused = false;
    }

    async loadJsonAsObj() {
        this.paused = true;
        const obj = await loadJsonAsObj();
        this.paused = false;
        return obj;
    }

    getPointerCrd(evt) {
        const offset = this.context.canvas.offset();
        const dpr = window.devicePixelRatio;
        const x = (evt.pageX - offset.left) * dpr;
        const y = this.context.height - (evt.pageY - offset.top) * dpr;
        return {x, y};
    }

    pointerCrdToSceneCrd(crd) {
        return {x: crd.x - this.context.width / 2, y: crd.y - this.context.height / 2};
    }

    getPointerCrdNormalized(evt) {
        const m = this.getPointerCrd(evt);
        return { x: m.x / this.context.width * 2 - 1, y: m.y / this.context.height * 2 -1 };
    }

    getPointerIntersects(pointer, scene) {
        if (!scene) { scene = this.scene; }
        this.context.raycaster.setFromCamera(pointer, this.context.camera);
        const intersects = this.context.raycaster.intersectObject( scene, true );

        if (intersects.length > 0) {
            return intersects.filter( (res)=> {
                return res && res.object;
            } )
        } else {
            return [];
        }
    }
}