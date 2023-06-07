varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;
uniform vec3 pA, pB;
uniform sampler2D referenceTexture;
uniform sampler2D tex;
//uniform sampler2D tex2;


void main( void ) {
    vec2 pa = (pA.xy + res * 0.5) / res;
    vec2 pb = (pB.xy + res * 0.5) / res;

    vec2 uv = vec2(mix(pa.x, pb.x, vUv.y), 1.0);
    vec4 color = texture2D(referenceTexture, uv);

    //vec4 color = texture2D(tex2, vUv);
    //color = vec4(vUv, 0.0, 1.0);
    gl_FragColor = color;
}