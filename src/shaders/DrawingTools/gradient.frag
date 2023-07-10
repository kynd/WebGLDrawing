varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vInitialPosition;
uniform vec2 res;

uniform sampler2D referenceTexture;
uniform vec3 c0, c1, c2, c3;
uniform sampler2D canvasTexture;


void main( void ) {
    vec3 ca = mix(c0, c1, vUv.s);
    vec3 cb = mix(c2, c3, vUv.s);
    vec3 color = mix(ca, cb, abs(vUv.t - 0.5) * 2.0);
    gl_FragColor = vec4(color, 1.0);
}

/*
void main( void ) {
    vec3 ca = mix(c0, c1, vUv.t);
    vec3 cb = mix(c2, c3, vUv.t);
    vec3 color = mix(ca, cb, abs(vUv.t - 0.5) * 2.0);
    gl_FragColor = vec4(color, 1.0);
}
*/