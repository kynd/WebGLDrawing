varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;
uniform vec2 center;
uniform float rotation;
uniform vec3 cA;
uniform sampler2D colorSource;
uniform sampler2D tex;

vec2 rotate2D(vec2 point, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  mat2 rotation = mat2(c, -s, s, c);
  return rotation * point;
}

void main( void ) {
    vec2 scrCrd = gl_FragCoord.xy - res * 0.5;
    vec2 offsetFromC = scrCrd - center;

    offsetFromC = rotate2D(offsetFromC, rotation);
    vec2 sampCrd = center + offsetFromC + res * 0.5;

    vec4 color = texture2D(tex, sampCrd / res);

    float lev = 1.0 - smoothstep(0.0, 0.99, color.a);
    //color = mix(color, vec4(cA, 1.0), lev);
    
    vec4 colorSrc = texture2D(colorSource, gl_FragCoord.xy / res);
    color = mix(color, vec4(colorSrc.rgb, 1.0), lev);
    gl_FragColor = color;

}