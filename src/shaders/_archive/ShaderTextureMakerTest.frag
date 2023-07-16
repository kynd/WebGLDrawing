varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;


void main( void ) {
    vec4 color = vec4(vUv, 1.0, 1.0);
    float d = length(vUv - vec2(0.5)) - 0.4;
    float l = smoothstep(0.0, 1.0 / res.x, d);
    color = vec4(vec3(1.0 - l), l);
    color = vec4(vec3((vUv.x + vUv.y) * 0.5), 1.0);
    gl_FragColor = color;
}