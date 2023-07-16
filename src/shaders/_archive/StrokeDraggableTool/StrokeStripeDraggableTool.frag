varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;

uniform float nSidePoints;
uniform float maxSidePoints;
uniform float offset;
uniform sampler2D referenceTexture;
uniform sampler2D sides;
uniform vec3 c0, c1, c2, c3;
uniform sampler2D canvasTexture;


vec2 uvToSampleCrd(vec2 uv) {
    float n = nSidePoints - 1.0;
    float y = fract(uv.y + offset);
    float u = (y * n + 0.5) / (maxSidePoints - 1.0);
    vec2 s0 = texture2D(sides, vec2(u, 0.0)).xy;
    vec2 s1 = texture2D(sides, vec2(u, 1.0)).xy;

    return (mix(s0, s1, uv.x) + res * 0.5);
}

void main( void ) {
    vec2 scrCrd = gl_FragCoord.xy - res * 0.5;
    vec2 sampCrd = vUv;
    //sampCrd.y = max(0.0, sampCrd.y);
    vec2 crd = uvToSampleCrd(sampCrd);

    float t = fract(crd.x / 24.0);
    t = fract(vUv.y * 24.0);
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