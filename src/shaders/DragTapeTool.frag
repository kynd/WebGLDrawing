varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;
#define N_SIDE 128

uniform vec3 cA;
uniform float pct;
uniform float nSidePoints;
uniform vec3 side0[N_SIDE];
uniform vec3 side1[N_SIDE];
uniform sampler2D colorSource;
uniform sampler2D tex;

vec2 sideCoord(in vec3[N_SIDE] side, float t) {
    float n = max(0.0, nSidePoints - 1.0);
    int i0 = int(n * t);
    int i1 = int(n * t) + 1;
    float tt = n * t - float(i0); 

    return mix(side[i0], side[i1], tt).xy;
}

vec2 uvToSampleCrd(vec2 uv) {
    vec2 s0 = sideCoord(side0, uv.y);
    vec2 s1 = sideCoord(side1, uv.y);
    return (mix(s0, s1, uv.x) + res * 0.5) / res;
}


void main( void ) {
    vec2 scrCrd = gl_FragCoord.xy - res * 0.5;
    vec2 sampCrd = vUv + vec2(0.0, -pct * 0.1);
    sampCrd.y = max(0.0, sampCrd.y);
    vec2 sampleCrd = uvToSampleCrd(sampCrd);
    vec4 color = texture2D(tex, sampleCrd);

    float lev = 1.0 - smoothstep(0.0, 0.99, color.a);
    lev *= vUv.y <= pct ? 1.0 : 0.0;
    //color = mix(color, vec4(cA, 1.0), lev);


    vec4 colorSrc = texture2D(colorSource, gl_FragCoord.xy / res);
    color = mix(color, vec4(colorSrc.rgb, 1.0), lev);

    gl_FragColor = color;

}