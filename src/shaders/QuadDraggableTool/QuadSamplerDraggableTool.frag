varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;
uniform vec3 pA, pB;
uniform sampler2D referenceTexture;
uniform sampler2D tex;
uniform float offset;
//uniform sampler2D tex2;
#define PI 3.14159265359

mat2 rot2D(float a) {
    float c = cos(a);
    float s = sin(a);
    return  mat2(c, -s, s, c);
}


void main( void ) {
    vec2 pa = (pA.xy + res * 0.5) / res;
    vec2 pb = (pB.xy + res * 0.5) / res;
    vec2 c = (pa + pb) * 0.5;
    //pa = c + (pa - c) * rot2D(offset * PI * 2.0);
    //pb = c + (pb - c) * rot2D(offset * PI * 3.0);
  
    vec2 uv = mix(pa.xy, pb.xy, vUv);

    uv = c + (uv - c) * rot2D(offset * PI * 2.0);
    vec4 color = texture2D(referenceTexture, uv);
    //vec4 color = texture2D(tex2, vUv);
    //color = vec4(vUv, 0.0, 1.0);
    gl_FragColor = color;
}