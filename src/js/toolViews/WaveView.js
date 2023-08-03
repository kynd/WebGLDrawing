
import * as THREE from 'three';
import { ToolView } from './ToolView.js';
import { createBezierCP2, cpToBezier, stripSidesFromArray, approxLenFromPointArr } from "../utils/DrawingUtil.js"
import { stripGeomDataFromSides, dataToGeom } from "../utils/GeomUtil.js"

export class WaveView extends ToolView {
    static ready = false;
    static async init() {
        await ToolView.initMaterials();
        WaveView.ready = true;
    }

    constructor(context) {
        super(context);
    }

    updateView() {
        if (this.vertices.length < 2) { return }

        const width = this.toolParams.sizeA ? this.toolParams.sizeA * 20 : 20;
        const amplitude = this.toolParams.sizeB ? this.toolParams.sizeB  * 40: 40;
        const cp = createBezierCP2(this.vertices);
        const bezierPoints = cpToBezier(cp, 8);
        let pp = bezierPoints[0].clone();
        let d = 0;
        bezierPoints.forEach((p, i) => {
            d += pp.distanceTo(p);
            const dir = p.clone().sub(pp).normalize();
            const perp = new THREE.Vector3(dir.y, -dir.x, 0);
            pp = p.clone();
            p.add(perp.multiplyScalar(Math.cos(i) * amplitude));
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

        this.approxL = approxLenFromPointArr(bezierPoints);
        this.approxW = width;
    }
}
