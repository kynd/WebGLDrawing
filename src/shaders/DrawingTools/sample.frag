varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vInitialPosition;
uniform vec2 res;

uniform sampler2D referenceTexture;
uniform sampler2D canvasTexture;
uniform vec3 c0, c1, c2, c3;

void main( void ) {
    vec2 sampCrd = (vInitialPosition.xy / res) + vec2(0.5);
    vec4 samp = texture2D(referenceTexture, sampCrd);
    gl_FragColor = samp;
}
