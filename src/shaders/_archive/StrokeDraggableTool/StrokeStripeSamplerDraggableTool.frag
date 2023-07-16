varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;

uniform float nSidePoints;
uniform float maxSidePoints;
uniform sampler2D referenceTexture;
uniform sampler2D sides;
uniform sampler2D canvasTexture;


vec2 uvToSampleCrd(vec2 uv) {
    float n = nSidePoints - 1.0;
    float u = (uv.y * n + 0.5) / (maxSidePoints - 1.0);
    vec2 s0 = texture2D(sides, vec2(u, 0.0)).xy;
    vec2 s1 = texture2D(sides, vec2(u, 1.0)).xy;

    return (mix(s0, s1, uv.x) + res * 0.5) / res;
}

void main( void ) {
    vec2 scrCrd = gl_FragCoord.xy - res * 0.5;
    vec2 sampCrd = vUv;
    sampCrd.y = max(0.0, sampCrd.y);
    vec2 sampleCrd = uvToSampleCrd(sampCrd);
    sampleCrd.y = 0.0;
    vec4 color = texture2D(referenceTexture, sampleCrd);

/*
    float u0 = (vUv.y * nSidePoints) / maxSidePoints;
    color = texture2D(sides, vUv.yx);
    color.rg = sampleCrd;
    color.b = 0.0;
    color.a = 1.0;
*/
    gl_FragColor = color;

}