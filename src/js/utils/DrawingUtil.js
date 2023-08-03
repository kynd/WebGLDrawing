import * as THREE from 'three';
import { Line } from './MathUtil.js';

export function distance2D(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
export function v(x, y, z) { return new THREE.Vector3(x, y, z) };

export function line(points, color) {
    const material = new THREE.LineBasicMaterial({ color });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    return line;
}

function addPos(arr, idx, p) {
    arr[idx * 3] = p.x;
    arr[idx * 3 + 1] = p.y;
    arr[idx * 3 + 2] = p.z;
}

function addUv(arr, idx, uv) {
    arr[idx * 2] = uv[0];
    arr[idx * 2 + 1] = uv[1];
}

export function stripSidesFromArray(arr, width) {
    const sides = [[], []];
    const hw = width * 0.5;
    if (arr.length >= 2) {
        for (let i = 0; i < arr.length - 1; i++) {
            const p0 = new v(arr[i].x, arr[i].y, 0.0);
            const p1 = new v(arr[i + 1].x, arr[i + 1].y, 0.0);
            const dir = new v(p1.x - p0.x, p1.y - p0.y, 0.0);

            const perp = dir.clone().applyAxisAngle(new v(0, 0, 1), Math.PI * 0.5).normalize();
            sides[0].push(p0.clone().add(perp.clone().multiplyScalar(hw)));
            sides[1].push(p0.clone().add(perp.clone().multiplyScalar(-hw)));
            if (i == arr.length - 2) {
                sides[0].push(p1.clone().add(perp.clone().multiplyScalar(hw)));
                sides[1].push(p1.clone().add(perp.clone().multiplyScalar(-hw)));
            }
        }
    }
    return sides;
}

export function qubicBezier(p0, p1, p2, p3, t) {
    const x = qubicBezier1D(p0.x, p1.x, p2.x, p3.x, t);
    const y = qubicBezier1D(p0.y, p1.y, p2.y, p3.y, t);
    if (p0.hasOwnProperty("z")) {
        const z = qubicBezier1D(p0.z, p1.z, p2.z, p3.z, t);
        return new THREE.Vector3(x, y, z);
    } else {
        return new THREE.Vector2(x, y);
    }
}

export function qubicBezier1D(p0, p1, p2, p3, t) {
    return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
}



export function cpToBezier(cp, res = 64) {
    const pts = [];
    for (let i = 0; i < cp.length / 3 - 1; i ++) {
        for (let j = 0; j < res; j ++) {
        const t = j / res;
        const pt = qubicBezier(
            cp[i * 3],
            cp[i * 3 + 1],
            cp[i * 3 + 2],
            cp[i * 3 + 3],
            t
        )
        pts.push(pt);
        }
    }
    pts.push(cp[cp.length - 1]);
    return pts;
}

function vcopy(p) {
    return p.clone();
}

function ip(p0, p1, t) {
    const v = p0.clone();
    return v.lerpVectors(p0, p1, t);
}

export function createDataTextureFromArray(arr) {
    const width = arr[0].length;
    const height = arr.length;

    const data = arrayToF32(arr);

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    
    return texture;
}

export function arrayToF32(arr) {
    const width = arr[0].length;
    const height = arr.length;
    const data = new Float32Array(width * height * 4);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const r = arr[i][j][0];
            const g = arr[i][j][1];
            const b = arr[i][j][2];
            const a = arr[i][j][3];

            const idx = (i * width + j) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
        }
    }
    return data;
}

export function createBezierCP(p) {
    if (p.lengths <= 1) {
    return [];
    }
    if (p.lengths == 2) {
    return [vcopy(p[0]),vcopy(p[0]),vcopy(p[1]),vcopy(p[1])];
    }
    
    const pts = [];
    for (let i = 0; i < p.length; i ++) {
        if (i == p.length - 1) {
            pts.push(ip(p[i-1], p[i], 0.75)); 
            pts.push(ip(p[i-1], p[i], 0.75)); 
            pts.push(vcopy(p[i]));
        } else if (i == 0) {
            pts.push(vcopy(p[0]));
            pts.push(ip(p[0],p[1], 0.25));
            pts.push(ip(p[0],p[1], 0.25));
            pts.push(ip(p[0],p[1], 0.5));
        }  else {
            const p0 = vcopy(p[i]);
            const p1 = ip(p[i], p[i + 1], 0.5);
            pts.push(p0);
            pts.push(p0);
            pts.push(p1);
        } 
    }
    return pts;
}

export function createBezierCP2(p) {
    if (p.lengths <= 1) {
        return [];
    }
    const pts = [];
    const tp = [];
    const cpt = (4/3) * Math.tan(Math.PI/8);
    for (let i = 0; i < p.length - 1; i ++) {
        tp.push(ip(p[i], p[i + 1], 0));
        tp.push(ip(p[i], p[i + 1], 0.25));
        tp.push(ip(p[i], p[i + 1], 0.5));
        tp.push(ip(p[i], p[i + 1], 0.75));
    }
    tp.push(vcopy(p[p.length - 1]));

    for (let i = 0; i < p.length - 1; i ++) {
        if (i == 0) {
        pts.push(tp[0]);
        pts.push(tp[1]);
        pts.push(tp[1]);
        pts.push(tp[2]);
        } else {
        const b = (i - 1) * 4;
        pts.push(tp[b + 3]);
        pts.push(tp[b + 5]);
        pts.push(tp[b + 6]);
        }
        
        if (i == p.length - 2) {
        pts.push(tp[tp.length - 2]);
        pts.push(tp[tp.length - 2]);
        pts.push(tp[tp.length - 1]);
        }
    }

    return pts;
}

export function createBezierCpLoop(p) {
    if (p.lengths <= 1) {
        return [];
    }
    const pts = [];
    const tp = [];
    for (let i = 0; i < p.length; i ++) {
        const i0 = i;
        const i1 = (i + 1) % p.length;
        tp.push(ip(p[i0], p[i1], 0));
        tp.push(ip(p[i0], p[i1], 0.25));
        tp.push(ip(p[i0], p[i1], 0.5));
        tp.push(ip(p[i0], p[i1], 0.75));
    }

    for (let i = 0; i < p.length; i ++) {
        const n = tp.length;
        const i0 = (i * 4 + 2) % n;
        const i1 = (i * 4 + 3) % n;
        const i2 = (i * 4 + 5) % n;
        pts.push(tp[i0]);
        pts.push(tp[i1]);
        pts.push(tp[i2]);
        if (i == p.length - 1) {
            const i3 = (i * 4 + 6) % tp.length;
            pts.push(tp[i3]);
        }
    }

    return pts;
}

export function approxLenFromPointArr(arr) {
    let length = 0;
    for (let i = 0; i < arr.length - 1; i ++) {
        length += arr[i].distanceTo(arr[i + 1]);
    }
    return length;
}

export function approxWLfromPointArr(arr) {
    let minX, minY, maxX, maxY;
    for (let i = 0; i < arr.length; i ++) {
        if (i == 0) {
            minX = maxX = arr[i].x;
            minY = maxY = arr[i].y;
        } else {
            minX = Math.min(minX, arr[i].x);
            minY = Math.min(minY, arr[i].y);
            maxX = Math.max(maxX, arr[i].x);
            maxY = Math.max(maxY, arr[i].y);
        }
    }
    return {w: maxX - minX, l: maxY - minY};
}