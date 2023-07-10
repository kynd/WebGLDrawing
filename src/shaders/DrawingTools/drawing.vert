varying vec2 vUv;
varying vec3 vNormal;
attribute vec3 initialPosition;
varying vec3 vInitialPosition;

void main()
{
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vInitialPosition = initialPosition;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}