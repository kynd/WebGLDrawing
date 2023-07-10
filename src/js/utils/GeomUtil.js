import * as THREE from 'three';
import { qubicBezier, createBezierCpLoop, cpToBezier } from './DrawingUtil.js';
import { Line } from './MathUtil.js';

function addAttrData(arr, idx, size, data) {
    for (let i = 0; i < size; i ++) {
        arr[idx * size + i] = data[i];
    }
}

function addPosAttrData(arr, idx, p) {
    arr[idx * 3] = p.x;
    arr[idx * 3 + 1] = p.y;
    arr[idx * 3 + 2] = p.z;
}

export function dataToGeom(data) {
    const geometry = new THREE.BufferGeometry();
    data.forEach((attr)=>{
        geometry.setAttribute(attr.name, new THREE.BufferAttribute(attr.data, attr.stride));
    });
    return geometry;
}

export function stripGeomDataFromSides(side) {
    const n = Math.min(side[0].length, side[1].length);
    const arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(side[0][i]);
        arr.push(side[1][i]);
    }
    return stripGeomDataFromArray(arr);
}

export function stripGeomDataFromArray(vertices) {
    const positions = new Float32Array(vertices.length * 18);
    const uvs = new Float32Array(vertices.length * 12);

    function setPos(idx, p) {
        positions[idx * 3] = p.z;
        positions[idx * 3 + 1] = p.y;
        positions[idx * 3 + 2] = p.x;
    }

    const n = vertices.length / 2;
    for (let i = 0; i < n - 1; i++) {
        const p0 = vertices[i * 2]
        const p1 = vertices[i * 2 + 1]
        const p2 = vertices[i * 2 + 2]
        const p3 = vertices[i * 2 + 3]
        const u0 = i / (n - 1);
        const u1 = (i + 1) / (n - 1);
        addPosAttrData(positions, i * 6 + 0, p2);
        addPosAttrData(positions, i * 6 + 1, p1);
        addPosAttrData(positions, i * 6 + 2, p0);
        addPosAttrData(positions, i * 6 + 3, p2);
        addPosAttrData(positions, i * 6 + 4, p3);
        addPosAttrData(positions, i * 6 + 5, p1);
        addAttrData(uvs, i * 6 + 0, 2, [0, u1]);
        addAttrData(uvs, i * 6 + 1, 2, [1, u0]);
        addAttrData(uvs, i * 6 + 2, 2, [0, u0]);
        addAttrData(uvs, i * 6 + 3, 2, [0, u1]);
        addAttrData(uvs, i * 6 + 4, 2, [1, u1]);
        addAttrData(uvs, i * 6 + 5, 2, [1, u0]);
    }
    return [
        { name:"position", data:positions, stride: 3},
        { name:"uv", data:uvs, stride: 2 }
    ];
}


export function quadGeomDataFromCorners(corners) {
    const l0 = new Line().fromTwoPoints(corners[0], corners[2]);
    const l1 = new Line().fromTwoPoints(corners[1], corners[3]);
    let c = l0.getIntersectionPoint(l1);
    if (!c) { c = corners[0].clone(); }

    const center = new THREE.Vector3(c.x, c.y, 0);
    const positions = new Float32Array(12 * 3);
    const uvs = new Float32Array(12 * 2);
    addPosAttrData(positions, 0, corners[0]);
    addPosAttrData(positions, 1, corners[1]);
    addPosAttrData(positions, 2, center);
    addPosAttrData(positions, 3, corners[1]);
    addPosAttrData(positions, 4, corners[2]);
    addPosAttrData(positions, 5, center);
    addPosAttrData(positions, 6, corners[2]);
    addPosAttrData(positions, 7, corners[3]);
    addPosAttrData(positions, 8, center);
    addPosAttrData(positions, 9, corners[3]);
    addPosAttrData(positions, 10, corners[0]);
    addPosAttrData(positions, 11, center);

    addAttrData(uvs, 0, 2, [0, 0]);
    addAttrData(uvs, 1, 2, [1, 0]);
    addAttrData(uvs, 2, 2, [0.5, 0.5]);
    addAttrData(uvs, 3, 2, [1, 0]);
    addAttrData(uvs, 4, 2, [1, 1]);
    addAttrData(uvs, 5, 2, [0.5, 0.5]);
    addAttrData(uvs, 6, 2, [1, 1]);
    addAttrData(uvs, 7, 2, [0, 1]);
    addAttrData(uvs, 8, 2, [0.5, 0.5]);
    addAttrData(uvs, 9, 2, [0, 1]);
    addAttrData(uvs, 10, 2, [0, 0]);
    addAttrData(uvs, 11, 2, [0.5, 0.5]);

    return [
        { name:"position", data:positions, stride: 3},
        { name:"uv", data:uvs, stride: 2 }
    ];
}

export function ovalGeomDataFromCorners(corners) {
    const l0 = new Line().fromTwoPoints(corners[0], corners[2]);
    const l1 = new Line().fromTwoPoints(corners[1], corners[3]);
    let c = l0.getIntersectionPoint(l1);
    if (!c) { c = corners[0].clone(); }
    const center = new THREE.Vector3(c.x, c.y, 0);
    const midPoints = [];
    for (let i = 0; i < 4; i ++) {
        midPoints.push(new THREE.Vector3().lerpVectors(corners[i], corners[(i + 1) % 4], 0.5));
    }

    const edgePoints = [];
    const res = 24;
    const cpt = (4/3) * Math.tan(Math.PI/8);
    for (let i = 0; i < 4; i ++) {
        const mi0 = i;
        const mi1 = (i + 1) % 4;
        const ci = (i + 1) % 4;
        const cp0 = new THREE.Vector3().lerpVectors(midPoints[mi0], corners[ci], cpt);
        const cp1 = new THREE.Vector3().lerpVectors(midPoints[mi1], corners[ci], cpt);
        for (let j = 0; j < res; j ++) {
            const t = j / res;
            const p = qubicBezier(midPoints[mi0], cp0, cp1, midPoints[mi1], t);
            edgePoints.push(p);
        }
    }

    const positions = new Float32Array(edgePoints.length * 3 * 3);
    const uvs = new Float32Array(edgePoints.length * 3 * 2);
    for (let i = 0; i < edgePoints.length; i ++) {
        const p0 = edgePoints[i];
        const p1 = edgePoints[(i + 1) % edgePoints.length];
        addPosAttrData(positions, i * 3, p0);
        addPosAttrData(positions, i * 3 + 1, p1);
        addPosAttrData(positions, i * 3 + 2, center);
        const v0 = i / edgePoints.length;
        const v1 = (i + 1) / edgePoints.length;

        addAttrData(uvs, i * 3, 2, [1, v0]);
        addAttrData(uvs, i * 3 + 1, 2, [1, v1]);
        addAttrData(uvs, i * 3 + 2, 2, [0.0, (v0 + v1) * 0.5]);
    }

    return [
        { name:"position", data:positions, stride: 3},
        { name:"uv", data:uvs, stride: 2 }
    ];
}


export function blobGeomDataFromVertices(vertices) {
    const sum = new THREE.Vector3();
    const tl = new THREE.Vector3(10000, 10000, 0), br = new THREE.Vector3(-10000, -10000, 0);

    vertices.forEach((v)=>{
        sum.add(v);
        tl.x = Math.min(tl.x, v.x);
        tl.y = Math.min(tl.y, v.y);
        br.x = Math.max(br.x, v.x);
        br.y = Math.max(br.y, v.y);
    });
    const center = sum.clone().divideScalar(Math.max(1, vertices.length));

    let v = []; 
    if (vertices.length > 2) {
        const cp = createBezierCpLoop(vertices);
        v = cpToBezier(cp, 24);
    }

    const positions = new Float32Array(v.length * 9);
    const uvs = new Float32Array(v.length * 6);
    for (let i = 0; i < v.length; i++) {
        const i0 = i % v.length;
        const i1 = (i + 1) % v.length;
        const v0 = i / v.length;
        const v1 = (i + 1) / v.length;
        addPosAttrData(positions, i * 3 + 0, v[i0]);
        addPosAttrData(positions, i * 3 + 1, v[i1]);
        addPosAttrData(positions, i * 3 + 2, center);
        addAttrData(uvs, i * 3, 2, [1, v0]);
        addAttrData(uvs, i * 3 + 1, 2, [1, v1]);
        addAttrData(uvs, i * 3 + 2, 2, [0.0, (v0 + v1) * 0.5]);
    }
    
    return [
        { name:"position", data:positions, stride: 3},
        { name:"uv", data:uvs, stride: 2 }
    ];
}



//////// TO DELETE
/*
export function stripFromSides(side) {
    const n = Math.min(side[0].length, side[1].length);
    const arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(side[0][i]);
        arr.push(side[1][i]);
    }
    return stripFromArray(arr);
}

export function stripFromArray(vertices) {
    //const geometry = new THREE.BufferGeometry();
    const data = stripGeomDataFromArray(vertices);
    //geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    //geometry.setAttribute('uv', new THREE.BufferAttribute(data.uvs, 2));
    return dataToGeom(data);
}

*/