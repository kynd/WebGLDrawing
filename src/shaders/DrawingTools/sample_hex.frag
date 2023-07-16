varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vInitialPosition;
uniform vec2 res;

uniform sampler2D referenceTexture;
uniform vec3 c0, c1, c2, c3;
uniform sampler2D canvasTexture;


vec3 col(vec2 disp) {
    vec2 uv = vUv.st;
    uv += disp;
    vec2 sampCrd = (vInitialPosition.xy / res) + vec2(0.5);
    vec4 samp = texture2D(canvasTexture, sampCrd + disp);

    vec3 ca = mix(c0, c1, uv.s);
    vec3 cb = mix(c2, c3, uv.s);
    vec3 color = mix(ca, cb, abs(uv.t - 0.5) * 2.0);
    if (length(samp.rgb - vec3(1.0)) > 0.01) {
        color = mix(ca, cb, 1.0 - abs(uv.t - 0.5) * 2.0);
        color = mix(cb, samp.rgb, 0.5);
    }
    return color;
}

void main( void ) {
    vec3 color = vec3(0.0);
    float n = 64.0;
    float sum = 0.0;
    for (float i = 0.0; i < n; i += 1.0) {
        float lev = n - i;
        vec2 disp = vec2(1.0) * float(i) / res;
        color += col(disp) * lev;
        sum += lev;
    }
    color /= sum;

    float a = 1.0;
    if (vUv.y < 0.33 - vUv.x || vUv.y > 1.66 - vUv.x) {
       // a = 0.0;
    }
    gl_FragColor = vec4(color, a);
}
