varying vec2 vUv;
varying vec3 vNormal;

uniform sampler2D tex;
uniform vec2 res;
uniform vec2 p0;
uniform vec2 p1;

float cross2D(vec2 a, vec2 b) {
    return a.x * b.y - a.y * b.x;
}

void main( void ) {
    vec4 color = vec4(0.5, 0.5, 0.5, 1.0);
    float size = 40.0;

    vec2 dir = normalize(p1 - p0);
    float crs = cross2D(dir, vUv - p1);


    float dt = dot(dir, vUv - p0);
    vec2 intersection = p0 + dir * dt;
    vec2 uv = vUv;
    uv.x = dt + p0.x;
    uv.y = distance(intersection, vUv) * (crs > 0.0 ? 1.0 : -1.0) + p0.y;
    //float d0 = length(p0 - vUv);
    //float d1 = length(p1 - vUv);
    //float d = smoothstep(0.1, 0.1 + 0.1 / res.x, d0 * d1 * d0 * d1);
    float d = -crs * 1.0;

    uv = d < 0.0 ? uv : vUv;

    vec2 crd = uv * res / size / 2.0;
    vec2 lCrd = fract(crd);
    ivec2 iCrd = ivec2(lCrd * 2.0);
    if (iCrd.x != iCrd.y) {
        color = vec4(vec3(0.0), 1.0);
    }

    color = mix(texture2D(tex, uv), color, 0.0);
    
    gl_FragColor = color;

}