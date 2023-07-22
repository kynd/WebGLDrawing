
import * as THREE from 'three';
import { ToolView } from './ToolView.js';
import { quadGeomDataFromCorners, dataToGeom} from "../utils/GeomUtil.js"

export class QuadView extends ToolView {
    static ready = false;
    static async init() {
        await ToolView.initMaterials();
        QuadView.ready = true;
    }

    constructor(context) {
        super(context);
    }

    updateView() {
        if (this.vertices.length < 4) { return }
        this.viewObj.geometry.dispose();
        const data = quadGeomDataFromCorners(this.vertices);
        if (this.isInitialCoordInSync) {
            this.initialPosition = { name: "initialPosition", data: data[0].data.slice(), stride: 3};
        }
        data.push(this.initialPosition);
        this.viewObj.geometry = dataToGeom(data);
    }
}
