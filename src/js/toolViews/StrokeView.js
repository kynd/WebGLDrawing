
import * as THREE from 'three';
import { ToolView } from './ToolView.js';
import { createBezierCP, cpToBezier, stripSidesFromArray, approxLenFromPointArr } from "../utils/DrawingUtil.js"
import { stripGeomDataFromSides, dataToGeom } from "../utils/GeomUtil.js"

export class StrokeView extends ToolView {
    static ready = false;
    static async init() {
        await ToolView.initMaterials();
        StrokeView.ready = true;
    }

    constructor(context) {
        super(context);
    }

    updateView() {
        if (this.vertices.length < 2) { return }
        const cp = createBezierCP(this.vertices);
        const bezierPoints = cpToBezier(cp);
        const width = this.toolParams.sizeA ? this.toolParams.sizeA * 12 : 8;

        const viewPoint = this.context.movingCamera ? this.context.movingCamera.position : null;
        this.sides = stripSidesFromArray(bezierPoints, width, viewPoint);

        this.viewObj.geometry.dispose();
        const data = stripGeomDataFromSides(this.sides)
        if (this.isInitialCoordInSync) {
            this.initialPosition = { name: "initialPosition", data: data[0].data.slice(), stride: 3};
        }
        data.push(this.initialPosition);
        this.viewObj.geometry = dataToGeom(data);
        
        this.approxL = approxLenFromPointArr(bezierPoints);
        this.approxW = width * 2;
    }
}
