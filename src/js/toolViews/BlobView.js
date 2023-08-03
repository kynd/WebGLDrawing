
import * as THREE from 'three';
import { ToolView } from './ToolView.js';
import { approxWLfromPointArr } from "../utils/DrawingUtil.js"
import { blobGeomDataFromVertices, dataToGeom } from "../utils/GeomUtil.js"

export class BlobView extends ToolView {
    static ready = false;
    static async init() {
        await ToolView.initMaterials();
        BlobView.ready = true;
    }

    constructor(context) {
        super(context);
    }

    updateView() {
        if (this.vertices.length < 2) { return }
        this.viewObj.geometry.dispose();
        const data = blobGeomDataFromVertices(this.vertices);
        if (this.isInitialCoordInSync) {
            this.initialPosition = { name: "initialPosition", data: data[0].data.slice(), stride: 3};
        }
        data.push(this.initialPosition);
        this.viewObj.geometry = dataToGeom(data);

        const wl = approxWLfromPointArr(this.vertices);
        this.approxW = wl.w;
        this.approxL = wl.l;
    }
}
