varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vInitialPosition;
uniform vec2 res;

uniform sampler2D referenceTexture;
uniform sampler2D canvasTexture;
uniform vec3 c0, c1, c2, c3;

void main( void ) {
    gl_FragColor = vec4(c0, 1.0);
}
