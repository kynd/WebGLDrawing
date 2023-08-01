varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vInitialPosition;
uniform vec2 res;

uniform sampler2D referenceTexture;
uniform vec3 c0, c1, c2, c3;
uniform sampler2D canvasTexture;

vec3 random3(vec3 c) {
    float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0*j);
    j *= .125;
    r.x = fract(512.0*j);
    j *= .125;
    r.y = fract(512.0*j);
    return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;
float snoise(vec3 p) {

    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));

    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e*(1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy*(1.0 - e);

    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0*G3;
    vec3 x3 = x - 1.0 + 3.0*G3;

    vec4 w, d;

    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);

    w = max(0.6 - w, 0.0);

    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);

    w *= w;
    w *= w;
    d *= w;

    return dot(d, vec4(52.0));
}

vec3 rColor(vec3 seed) {
    float n = snoise(seed);
    if (n < -0.3) {
        return c0;
    } else if (n < 0.0) {
        return c1;
    } else if (n > 0.3) {
        return c2;
    } else {
        return c3;
    }
}

vec3 col(vec2 disp) {
    vec2 uv = vUv.st;
    uv += disp;
    vec2 sampCrd = (vInitialPosition.xy / res) + vec2(0.5);
    vec4 samp = texture2D(canvasTexture, sampCrd + disp);

    
    vec3 ca = rColor(vec3(vUv * 20.0, 1.0));//mix(c0, c1, uv.s);
    vec3 cb = rColor(vec3(vUv * 20.0, 2.0));//mix(c2, c3, uv.s);
    vec3 color = mix(ca, cb, abs(uv.t - 0.5) * 2.0);
    
    if (length(samp.rgb - vec3(1.0)) > 0.01) {
        color = mix(ca, cb, 1.0 - abs(uv.t - 0.5) * 2.0);
        color = mix(cb, samp.rgb, 1.0);
    }
    return color;
}

void main( void ) {
    vec3 color = vec3(0.0);
    float n = 64.0;
    float sum = 0.0;
    for (float i = 0.0; i < n; i += 1.0) {
        float lev = n - i;
        vec2 dir = vec2(snoise(vec3(c0.rg * 100.0, 1.0)), snoise(vec3(c1.rg * 100.0, 5.0)));
        dir *= snoise(vec3(vUv * 100.0, 1.0));
        vec2 disp = dir * float(i) / res * 25.0;
        color += col(disp) * lev;
        sum += lev;
    }
    color /= sum;
    gl_FragColor = vec4(color, 1.0);
}
