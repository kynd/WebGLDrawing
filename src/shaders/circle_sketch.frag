varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 res;
uniform vec2 center;
uniform vec2 pointer;
uniform vec3 cA;
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
    vec2 pointerDir = pointer - center;

    float rot = atan(pointerDir.y, pointerDir.x);
    offsetFromC = rotate2D(offsetFromC, rot);
    vec2 sampCrd = center + offsetFromC + res * 0.5;

    vec4 color = texture2D(tex, sampCrd / res);

    if (color.a == 0.0) {
        color.rgb = cA;
    } else {
        //color = samp;
    }

    float d = length(scrCrd - center);
    if (d < 10.0) {
        color.g = 1.0;
    }
    color.a = 1.0;
    gl_FragColor = color;

}