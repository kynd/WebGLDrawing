varying vec2 vUv;
varying vec3 vNormal;

uniform vec2 res;

void main( void ) {
    vec4 color = vec4(1.0);
    float size = 40.0;
    vec2 crd = vUv * res / size / 2.0;
    vec2 lCrd = fract(crd);
    ivec2 iCrd = ivec2(lCrd * 2.0);
    if (iCrd.x != iCrd.y) {
        color = vec4(vec3(0.0), 1.0);
    }
    gl_FragColor = color;

}