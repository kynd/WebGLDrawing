
import * as THREE from 'three';

export class RandomPalette {
    constructor(palette) {
        this.palette = palette;
    }
    get() {
        return this.palette[Math.floor(Math.random() * this.palette.length)];
    }
}

export class CyclePalette {
    constructor(palette) {
        this.palette = palette;
        this.idx = -1;
    }
    get() {
        this.idx = (this.idx + 1) % this.palette.length;
        return this.palette[this.idx];
    }
}

export const palette01 = [
    0xFFD429,
    0x68DF58,
    0xFC3646,
    0x206DFA
]

export function hexToRGB(hex) {
    if (hex.charAt(0) === '#') {
      hex = hex.substr(1);
    }
  
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
  
    return {
      r: r,
      g: g,
      b: b
    };
}

export function hexToThreeColor(hex) {
    if (hex.charAt(0) === '#') {
      hex = hex.substr(1);
    }
    const decimalValue = parseInt(hex, 16);
    const color = new THREE.Color();
    color.set(decimalValue);
    return color;
  }

export function rgbToHex(rgb) {
    var r = clamp(rgb.r, 0, 255);
    var g = clamp(rgb.g, 0, 255);
    var b = clamp(rgb.b, 0, 255);
  
    var hexR = r.toString(16).padStart(2, '0');
    var hexG = g.toString(16).padStart(2, '0');
    var hexB = b.toString(16).padStart(2, '0');
  
    var hexString = '#' + hexR + hexG + hexB;
  
    return hexString;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max); 
}

export function getRandomColor() {
    var color = new THREE.Color();
    color.setRGB(Math.random(), Math.random(), Math.random());
    return color;
  }
  