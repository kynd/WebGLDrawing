
import * as THREE from 'three';
import { ToolView } from './ToolView.js';
import { createBezierCP2, cpToBezier, stripSidesFromArray } from "../utils/DrawingUtil.js"
import { stripGeomDataFromSides, dataToGeom } from "../utils/GeomUtil.js"

export class SpiralView extends ToolView {
    static ready = false;
    static async init() {
        await ToolView.initMaterials();
        SpiralView.ready = true;
    }

    constructor(context) {
        super(context);
    }

    updateView() {
        if (this.vertices.length < 2) { return }

        const width = this.toolParams.sizeA ? this.toolParams.sizeA * 12 : 8;
        const roll = this.toolParams.sizeB ? this.toolParams.sizeB  * 0.5: 1;
        const cp = createBezierCP2(this.vertices);
        const bezierPoints = cpToBezier(cp, 8);
        let pp = bezierPoints[0].clone();
        let d = 0;
        bezierPoints.forEach((p, i) => {
                d += pp.distanceTo(p);
                pp = p.clone();
                const ang = d / 360 * Math.PI * roll;
                p.x += Math.cos(ang) * 128;
                p.y += Math.sin(ang) * 128;
            }
        )
        const cp2 = createBezierCP2(bezierPoints);
        const bezierPoints2 = cpToBezier(cp2, 8);
        const sides = stripSidesFromArray(bezierPoints2, width);

        this.viewObj.geometry.dispose();
        const data = stripGeomDataFromSides(sides)
        if (this.isInitialCoordInSync) {
            this.initialPosition = { name: "initialPosition", data: data[0].data.slice(), stride: 3};
        }
        data.push(this.initialPosition);
        this.viewObj.geometry = dataToGeom(data);
    }
}


