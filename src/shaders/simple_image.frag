varying vec2 vUv;
varying vec3 vNormal;

uniform vec2 res;
uniform sampler2D tex;

void main( void ) {
    vec4 color = texture2D(tex, vUv);
    gl_FragColor = color;
}