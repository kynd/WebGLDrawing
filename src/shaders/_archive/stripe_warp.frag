varying vec2 vUv;
varying vec3 vNormal;

uniform sampler2D tex;
uniform vec2 res;
uniform vec2 p0;
uniform vec2 p1;
uniform vec2 p2;
uniform vec2 p3;

float cross2D(vec2 a, vec2 b) {
    return a.x * b.y - a.y * b.x;
}


vec2 warp(vec2 uv, vec2 p0, vec2 p1, float m) {

    vec2 mp = (p0 + p1) * 0.5;
    vec2 dir = normalize(mp - p0);
    float crs = cross2D(dir, uv - mp);

    float dt = dot(dir, uv - mp);
    vec2 intersection = mp + dir * dt;
    vec2 nuv = vUv;
    nuv.x = dt + mp.x;
    nuv.y = distance(intersection, uv) * (crs > 0.0 ? 1.0 : -1.0) + mp.y;
    float d = -crs * 1.0;

    return nuv;

}

void main( void ) {
    vec4 color = vec4(0.5, 0.5, 0.5, 1.0);
    float size = 40.0;

    vec2 uvA = warp(vUv, p0, p1, 1.0);
    vec2 uvB = warp(vUv, p2, p3, -1.0);
    float m0 = (p0.y + p1.y) * 0.5;
    float m1 = (p2.y + p3.y) * 0.5;

    vec2 uv = mix(uvA, uvB, smoothstep(m0, m1, vUv.y));
    vec2 crd = uv * res / size / 2.0;
    vec2 lCrd = fract(crd);
    ivec2 iCrd = ivec2(lCrd * 2.0);
    if (iCrd.x != iCrd.y) {
        color = vec4(vec3(0.0), 1.0);
    }

    //color = mix(texture2D(tex, uv), color, 0.0);
    
    gl_FragColor = color;

}