varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;

uniform vec3 cA;
uniform vec3 cB;

void main( void ) {
    vec4 color = vec4(1.0);
    color.rgb = mix(cA, cB, vUv.t);
    gl_FragColor = color;

}