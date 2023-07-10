varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vInitialPosition;
uniform vec2 res;

uniform float dir;
uniform sampler2D referenceTexture;
uniform vec3 c0, c1, c2, c3;
uniform sampler2D canvasTexture;

void main( void ) {
    float t = (dir == 0.0) ? fract(vUv.x * 8.0) : fract(vUv.y * 8.0);
    vec3 color = c0;
    if (t > 0.75) {
        color = c3;
    } else if (t > 0.5) {
        color = c2;
    } else if (t > 0.25) {
        color = c1;
    }
    gl_FragColor = vec4(color, 1.0);
}