
import * as THREE from 'three';
import { ToolView } from './ToolView.js';
import { ovalGeomDataFromCorners, dataToGeom} from "../utils/GeomUtil.js"

export class OvalView extends ToolView {
    static ready = false;
    static async init() {
        await ToolView.initMaterials();
        OvalView.ready = true;
    }

    constructor(context) {
        super(context);
    }

    updateView() {
        if (this.vertices.length < 4) { return }
        this.viewObj.geometry.dispose();
        const data = ovalGeomDataFromCorners(this.vertices);
        if (this.isInitialCoordInSync) {
            this.initialPosition = { name: "initialPosition", data: data[0].data.slice(), stride: 3};
        }
        data.push(this.initialPosition);
        this.viewObj.geometry = dataToGeom(data);

        this.approxW = (this.vertices[0].distanceTo(this.vertices[1]) + this.vertices[2].distanceTo(this.vertices[3])) / 2;
        this.approxL = (this.vertices[0].distanceTo(this.vertices[3]) + this.vertices[1].distanceTo(this.vertices[2])) / 2;
    }
}
