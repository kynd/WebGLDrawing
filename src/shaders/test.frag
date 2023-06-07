uniform sampler2D tex;
varying vec2 vUv;
varying vec3 vNormal;

void main( void ) {
    vec4 color = texture2D(tex, vUv);
    color.b = color.g;
    color.rg = vUv;
    gl_FragColor = color;

}