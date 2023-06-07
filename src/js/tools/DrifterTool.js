
import * as THREE from 'three';
import {v, line, disposeObject, distance2D, stripSidesFromArray, stripFromSides} from "../utils/DrawingUtil.js"
import { Tween } from '../utils/Tween.js';
import { loadText } from '../utils/FileUtil.js'
import { CyclePalette, palette01 } from '../utils/ColorUtil.js';

export class DrifterTool {

    static ready = false;

    static async init() {
        DrifterTool.vertexShaderSource = await loadText('../shaders/common.vert');
        DrifterTool.fragmentShaderSource = await loadText('../shaders/DrifterTool.frag');
        DrifterTool.ready = true;
        DrifterTool.palette = new CyclePalette(palette01);
    }

    constructor() {
        this.tween = new Tween();
        this.count = 0;
        this.maxCount = 90;
        this.isDone = false;
        this.color = DrifterTool.palette.get();
        this.points = [];

        this.sideUniformLength = 128;
        this.prevLength = 0;
        this.uSide0 = Array(this.sideUniformLength).fill(new THREE.Vector3(0, 0, 0));
        this.uSide1 = Array(this.sideUniformLength).fill(new THREE.Vector3(0, 0, 0));
    }

    updatePreview(data) {
        this.data = data;
        if (this.points.length == 0) {
            this.points.push(data.pointer);
        }
        const lastPoint = this.points[this.points.length - 1];
        if (distance2D(lastPoint, data.pointer) > 5) {
            this.points.push(data.pointer);
        }
        this.sides = stripSidesFromArray(this.smoothenPoints(this.points), 300);
        this.updatePreviewObj();
        this.updatePrintObj();
    }

    updateAuto() {
        if (!this.data) {
            this.isDone = true; return;
        }
        //this.rotation = this.tween.powerInOut(this.count / maxCount) * Math.PI / 2;
        this.count ++;
        if (this.count > this.maxCount) {
            this.isDone = true;
        }

        this.updatePrintObj();
    }

    updatePreviewObj() {
        if (!this.previewObj) {
            this.previewObj = new THREE.Object3D();
        } else {
            disposeObject(this.line0);
            disposeObject(this.line1);
        }
        this.line0 = line(this.sides[0], 0x000000);
        this.line1 = line(this.sides[1], 0x000000);
        this.previewObj.add(this.line0);
        this.previewObj.add(this.line1);
    }

    updatePrintObj() {
        if (!this.printObj) {
            const stripMaterial = new THREE.ShaderMaterial({
                vertexShader: DrifterTool.vertexShaderSource,
                fragmentShader: DrifterTool.fragmentShaderSource,
                uniforms: {
                    res: { value: new THREE.Vector2(this.data.context.width, this.data.context.height)},
                }
            })
            this.printObj = new THREE.Mesh(new THREE.BufferGeometry(), stripMaterial);
        }

        this.printObj.geometry.dispose();
        this.printObj.geometry = stripFromSides(this.sides)

        const uniforms = this.printObj.material.uniforms;

        const len0 = this.sides[0].length;
        const len1 = this.sides[1].length;
        const nSideLength = Math.min(len0, len1);

        for (let i = Math.max(0, this.prevLength - 2); i < nSideLength; i ++) {
            this.uSide0[i] = v(this.sides[0][i].x, this.sides[0][i].y, 0.0);
            this.uSide1[i] = v(this.sides[1][i].x, this.sides[1][i].y, 0.0);
        }
        this.prevLength = nSideLength;

        if (len0 > this.sideUniformLength) {
            console.log(`WARNING: The strip has too many vertices ${len0}, ${len1}. Keep it under ${this.sideUniformLength}` );
        }

        uniforms.nSidePoints = {value: nSideLength};
        uniforms.side0 = {value: this.uSide0};
        uniforms.side1 = {value: this.uSide1};
        uniforms.tex = {value: this.data.tex.texture};
        uniforms.colorSource = {value: this.data.colorSource};
        uniforms.cA = {value: new THREE.Color(this.color).toArray() };
        uniforms.pct = {value: this.tween.powerInOut(this.count / (this.maxCount - 1))};
    }

    smoothenPoints(arr) {
        const newArr = [];
        for (let i = 0; i < arr.length; i ++) {
            if (i == 0 || i == arr.length - 1) {
                newArr.push({x: arr[i].x, y: arr[i].y});
            } else {
                newArr.push({x: (arr[i - 1].x + arr[i + 1].x) * 0.5, 
                    y: (arr[i - 1].y + arr[i + 1].y) * 0.5});
            }
        }
        return newArr;
    }


    endPreview() {
        if (this.previewObj) {disposeObject(this.previewObj);}
    }

    dispose() {
        if (this.previewObj) {disposeObject(this.previewObj);}
        if (this.printObj) {disposeObject(this.printObj);}
    }
}