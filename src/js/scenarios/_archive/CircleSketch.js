import * as THREE from 'three';
import { ScenarioBase } from "../ScenarioBase.js";
import { v, line, disposeObject, distance2D } from "../../utils/DrawingUtil.js"
import { PingPong } from '../../scenes/PingPong.js';
import { loadText } from '../../utils/FileUtil.js'
import { Tween } from '../../utils/Tween.js'

export class CircleSketch extends ScenarioBase {
    constructor() {
        super();
        this.setupContext(1920, 1920);
        this.setup();
        this.asyncStart();
    }

    async asyncStart() {
        await Circle.init();
        this.start();
    }

    setup() {
        this.scene = new THREE.Scene();
        this.printScene = new THREE.Scene();
        //this.context.renderer.setClearColor(0xFFFFFFFF);
        this.pingPong = new PingPong(this.context, '../shaders/simple_image.frag');
        this.isDragging = false;
    }

    pointerMove(evt) {
        if (this.isDragging) {
            this.updateCircle(evt);
        }
    }

    pointerDown(evt) {
        this.isDragging = true;
        this.dragStartPointerCrd = this.getPointerCrd(evt);

        this.circle = new Circle();
        this.updateCircle(evt);
        this.scene.add(this.circle.outlineObj);
        this.scene.add(this.circle.fillObj);
    }

    updateCircle(evt) {
        const crd = this.getPointerCrd(evt);
        const radius = distance2D(this.dragStartPointerCrd, crd);
        const center = this.pointerCrdToSceneCrd(this.dragStartPointerCrd);
        const pointer = this.pointerCrdToSceneCrd(crd);
        this.circle.update({
            x: center.x,
            y: center.y,
            px: pointer.x,
            py: pointer.y,
            radius,
            tex: this.pingPong.getCopyRenderTarget(),
            context: this.context
        }, this.context);
    }

    pointerUp(evt) {
        this.isDragging = false;
        if (this.circle) {
            this.circle.isDone = true;
        }
    }

    update() {
        this.context.renderer.autoClear = false;
        this.context.renderer.render( this.pingPong.scene, this.context.camera);
        this.context.renderer.render( this.scene, this.context.camera);
        this.context.renderer.autoClear = true;

        if (this.circle && this.circle.isDone) {
            this.printScene.add(this.circle.fillObj);
            this.pingPong.renderOnCurrentRenderTarget(this.printScene);
            this.circle.dispose();
            this.circle = null;
            this.pingPong.update();
        }
    }
}

class Circle {
    static async init() {
        this.tween = new Tween();
        Circle.vertexShaderSource = await loadText('../shaders/common.vert');
        Circle.fragmentShaderSource = await loadText('../shaders/circle_sketch.frag');
    }

    static colors = [
        0xFF5919,
        0x34A853,
        0xD7FFE9,
        0xF2DE00
    ]
    static colorIdx = 0;
    constructor() {
        this.isDone = false;
        this.color = Circle.colors[Circle.colorIdx ++  % Circle.colors.length];
    }

    update(data) {
        this.x = data.x;
        this.y = data.y;
        this.radius = data.radius;
        this.res = data.res ? data.res : 64;

        if (!this.outlineObj) {
            const arr = [];
            for (let i = 0; i <= this.res; i ++) {
                arr.push(v(0,0,0));
            }
            this.outlineObj = line(arr, 0x000000);
        }

        const positions = this.outlineObj.geometry.attributes.position;
        for (let i = 0; i <= this.res; i ++) {
            const a = this.tween.powerInOut(i / this.res) * Math.PI * 2;
            const x = this.x + Math.cos(a) * this.radius;
            const y = this.y + Math.sin(a) * this.radius;
            positions.setXYZ( i, x, y, 0 );
        }
        positions.needsUpdate = true;

        if (!this.fillObj) {
            const circleGeometry = new THREE.CircleGeometry(this.radius, this.res);
            const circleMaterial = new THREE.ShaderMaterial({
                vertexShader: Circle.vertexShaderSource,
                fragmentShader: Circle.fragmentShaderSource,
                uniforms: {
                    res: { value: new THREE.Vector2(data.context.width, data.context.height)},
                }
            });
            this.fillObj = new THREE.Mesh(circleGeometry, circleMaterial);
        } else {
            this.fillObj.geometry.dispose();
            this.fillObj.geometry = new THREE.CircleGeometry(this.radius, this.res);
        }
        this.fillObj.material.uniforms.tex = {value: data.tex.texture};
        this.fillObj.material.uniforms.center = {value: [this.x, this.y]};
        this.fillObj.material.uniforms.pointer = {value: [data.px, data.py]};
        this.fillObj.material.uniforms.cA = {value: new THREE.Color(this.color).toArray() };
        this.fillObj.position.x = this.x;
        this.fillObj.position.y = this.y;
    }

    dispose() {
        if (this.outlineObj) {disposeObject(this.outlineObj);}
        if (this.fillObj) {disposeObject(this.fillObj);}
    }
}