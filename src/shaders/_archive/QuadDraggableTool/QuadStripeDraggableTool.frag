varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;
uniform vec3 pA, pB;
uniform vec3 c0, c1, c2, c3;
uniform sampler2D referenceTexture;
uniform sampler2D tex;
//uniform sampler2D tex2;


void main( void ) {

    vec2 crd = mix(pA.xy, pB.xy, vUv);

    //vec2 crd = gl_FragCoord.xy;
    float t = fract(crd.x / 24.0);
    vec3 color = c0;
    if (t > 0.75) {
        color = c3;
    } else if (t > 0.5) {
        color = c2;
    } else if (t > 0.25) {
        color = c1;
    }

    //vec2 uv = vec2(mix(pa.x, pb.x, vUv.y), 1.0);
    //vec4 color = texture2D(referenceTexture, uv);

    //vec4 color = texture2D(tex2, vUv);
    //color = vec4(vUv, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}