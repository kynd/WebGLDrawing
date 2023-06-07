import * as THREE from 'three';
export class FloatDataTexture {
    constructor(data, width, height, linear = true) {
        this.width = width;
        this.height = height;
        if (!data) {
            this.data = new Float32Array(width * height * 4);
        } else {
            this.data = data;
        }
        this.texture = new THREE.DataTexture(this.data, width, height, THREE.RGBAFormat, THREE.FloatType);
        if (linear) {
            this.texture.magFilter = THREE.LinearFilter;
            this.texture.minFilter = THREE.LinearFilter;
        }
        this.texture.needsUpdate = true;
    }

    set(data) {
        this.data = data;
    }

    setValue(x, y, c, v) {
        const idx = (y * this.width + x) * 4;
        this.data[idx + c] = v;
    }

    setPixel(x, y, p) {
        const idx = (y * this.width + x) * 4;
        this.data[idx + 0] = p[0];
        this.data[idx + 1] = p[1];
        this.data[idx + 2] = p[2];
        this.data[idx + 3] = p[3];
    }

    update() {
        this.texture.image.data.set(this.data);
        this.texture.needsUpdate = true;
    }
}