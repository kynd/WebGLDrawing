import * as THREE from 'three';
import { Line } from '../utils/GeomUtil.js';

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

export function quadFromCorners(corners) {
    const l0 = new Line().fromTwoPoints(corners[0], corners[2]);
    const l1 = new Line().fromTwoPoints(corners[1], corners[3]);
    let c = l0.getIntersectionPoint(l1);
    if (!c) { c = corners[0].clone(); }

    const center = v(c.x, c.y, 0);
    const positions = new Float32Array(12 * 3);
    const uvs = new Float32Array(12 * 2);
    addPos(positions, 0, corners[0]);
    addPos(positions, 1, corners[1]);
    addPos(positions, 2, center);
    addPos(positions, 3, corners[1]);
    addPos(positions, 4, corners[2]);
    addPos(positions, 5, center);
    addPos(positions, 6, corners[2]);
    addPos(positions, 7, corners[3]);
    addPos(positions, 8, center);
    addPos(positions, 9, corners[3]);
    addPos(positions, 10, corners[0]);
    addPos(positions, 11, center);

    addUv(uvs, 0, [0, 0]);
    addUv(uvs, 1, [1, 0]);
    addUv(uvs, 2, [0.5, 0.5]);
    addUv(uvs, 3, [1, 0]);
    addUv(uvs, 4, [1, 1]);
    addUv(uvs, 5, [0.5, 0.5]);
    addUv(uvs, 6, [1, 1]);
    addUv(uvs, 7, [0, 1]);
    addUv(uvs, 8, [0.5, 0.5]);
    addUv(uvs, 9, [0, 1]);
    addUv(uvs, 10, [0, 0]);
    addUv(uvs, 11, [0.5, 0.5]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geometry;
}

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
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(vertices.length * 18);
    const uvs = new Float32Array(vertices.length * 12);

    function setPos(idx, p) {
        positions[idx * 3] = p.z;
        positions[idx * 3 + 1] = p.y;
        positions[idx * 3 + 2] = p.x;
    }

    function setUv(idx, u, v) {
        uvs[idx * 2] = v;
        uvs[idx * 2 + 1] = u;
    }

    const n = vertices.length / 2;
    let pn = 0;
    for (let i = 0; i < n - 1; i++) {
        const p0 = vertices[i * 2]
        const p1 = vertices[i * 2 + 1]
        const p2 = vertices[i * 2 + 2]
        const p3 = vertices[i * 2 + 3]
        const u0 = i / (n - 1);
        const u1 = (i + 1) / (n - 1);
        setPos(i * 6 + 0, p2);
        setPos(i * 6 + 1, p1);
        setPos(i * 6 + 2, p0);
        setPos(i * 6 + 3, p2);
        setPos(i * 6 + 4, p3);
        setPos(i * 6 + 5, p1);

        setUv(i * 6 + 0, 0, u1);
        setUv(i * 6 + 1, 1, u0);
        setUv(i * 6 + 2, 0, u0);
        setUv(i * 6 + 3, 0, u1);
        setUv(i * 6 + 4, 1, u1);
        setUv(i * 6 + 5, 1, u0);
        pn += 6;
    }
    positions.reverse();
    uvs.reverse();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geometry;
}

export function stripSidesFromArray(arr, width) {
    const sides = [[], []];
    const hw = width * 0.5;
    if (arr.length >= 2) {
        for (let i = 0; i < arr.length - 1; i++) {
            const p0 = new v(arr[i].x, arr[i].y, 0.0);
            const p1 = new v(arr[i + 1].x, arr[i + 1].y, 0.0);
            //console.log(p0, p1);
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

export function disposeObject(obj) {
    if (obj.parent) {
        obj.parent.remove(obj);
    }

    if (obj.geometry) {
        obj.geometry.dispose();
    }

    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach((material) => {
                if (material.map) {
                    material.map.dispose();
                }
                if (material.lightMap) {
                    material.lightMap.dispose();
                }
                if (material.bumpMap) {
                    material.bumpMap.dispose();
                }
                if (material.normalMap) {
                    material.normalMap.dispose();
                }
                if (material.specularMap) {
                    material.specularMap.dispose();
                }
                if (material.envMap) {
                    material.envMap.dispose();
                }
                material.dispose();
            });
        } else {
            if (obj.material.map) {
                obj.material.map.dispose();
            }
            if (obj.material.lightMap) {
                obj.material.lightMap.dispose();
            }
            if (obj.material.bumpMap) {
                obj.material.bumpMap.dispose();
            }
            if (obj.material.normalMap) {
                obj.material.normalMap.dispose();
            }
            if (obj.material.specularMap) {
                obj.material.specularMap.dispose();
            }
            if (obj.material.envMap) {
                obj.material.envMap.dispose();
            }
            obj.material.dispose();
        }
    }

    // Recursively dispose children
    if (obj.children) {
        while (obj.children.length > 0) {
            disposeObject(obj.children[0]);
        }
    }
}

export function qubicBezier(p0, p1, p2, p3, t) {
    const x = qubicBezier1D(p0.x, p1.x, p2.x, p3.x, t);
    const y = qubicBezier1D(p0.y, p1.y, p2.y, p3.y, t);
    if (p0.z) {
        const z = qubicBezier1D(p0.z, p1.z, p2.z, p3.z, t);
        return new THREE.Vector3(x, y, z);
    } else {
        return new THREE.Vector2(x, y);
    }
}

/*
export function qubicBezier3D(p0, p1, p2, p3, t) {
    const x = qubicBezier(p0.x, p1.x, p2.x, p3.x, t);
    const y = qubicBezier(p0.y, p1.y, p2.y, p3.y, t);
    const z = qubicBezier(p0.z, p1.z, p2.z, p3.z, t);
    return { x, y, z };
}

export function qubicBezier2D(p0, p1, p2, p3, t) {
    const x = qubicBezier(p0.x, p1.x, p2.x, p3.x, t);
    const y = qubicBezier(p0.y, p1.y, p2.y, p3.y, t);
    return { x, y };
}
*/

export function qubicBezier1D(p0, p1, p2, p3, t) {
    return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
}

export function createBezierCP(p) {
    if (p.lengths <= 1) {
      return [];
    }
    if (p.lengths == 2) {
      return [cp(p[0]),cp(p[0]),cp(p[1]),cp(p[1])];
    }
    
    const pts = [];
    for (let i = 0; i < p.length; i ++) {
      if (i == p.length - 1) {
        pts.push(ip(p[i-1], p[i], 0.75)); 
        pts.push(ip(p[i-1], p[i], 0.75)); 
        pts.push(cp(p[i])); continue;
      }
      if (i == 0) {
        pts.push(cp(p[0]));
        pts.push(ip(p[0],p[1], 0.25));
        pts.push(ip(p[0],p[1], 0.25));
        pts.push(ip(p[0],p[1], 0.5));
      }  else {
        const p0 = cp(p[i]);
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
    for (let i = 0; i < p.length - 1; i ++) {
      tp.push(ip(p[i], p[i + 1], 0));
      tp.push(ip(p[i], p[i + 1], 0.25));
      tp.push(ip(p[i], p[i + 1], 0.5));
      tp.push(ip(p[i], p[i + 1], 0.75));
    }
    tp.push(cp(p[p.length - 1]));
    
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

  function cp(p) {
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