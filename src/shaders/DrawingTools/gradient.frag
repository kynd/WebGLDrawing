varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;

uniform float nSidePoints;
uniform float maxSidePoints;
uniform float offset;
uniform sampler2D referenceTexture;
uniform sampler2D sides;
uniform vec3 c0, c1, c2, c3;
uniform float dir;
uniform sampler2D canvasTexture;


vec2 uvToSampleCrd(vec2 uv) {
    float n = nSidePoints - 1.0;
    float y = fract(uv.y);
    float u = (y * n + 0.5) / (maxSidePoints - 1.0);
    vec2 s0 = texture2D(sides, vec2(u, 0.0)).xy;
    vec2 s1 = texture2D(sides, vec2(u, 1.0)).xy;

    return (mix(s0, s1, uv.x) + res * 0.5);
}

void main( void ) {
    vec3 ca = mix(c0, c1, vUv.s);
    vec3 cb = mix(c1, c2, vUv.s);
    vec3 color = mix(ca, cb, vUv.t);
    gl_FragColor = vec4(color, 1.0);
}