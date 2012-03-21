const float pi = 3.1415926535897932384626433832795029;

attribute vec2 Rxy;
attribute vec2 position2D;
vec4 P,N;

uniform mat4 pMatrix;
uniform mat4 mvMatrix;
uniform vec4 pointLightingLocation;

uniform float time;
uniform float mixv;

varying vec4 normal;
varying vec2 texCoord;
varying vec4 position4;
varying vec4 pointLightingDirection;

void main(void) {
    vec4 Pa, Na, Pb, Nb;
    blenda(Pa, Na, position2D);
    blendb(Pb, Nb, position2D);
    P = mix(Pa,Pb,mixv);
    N = mix(Na,Nb,mixv);

    texCoord = position2D;
    normal = N*mvMatrix;

    position4 = P*mvMatrix - vec4(0.,0.,4.,0.);
    position4 /= position4.w;
    pointLightingDirection = vec4(
      normalize( pointLightingLocation.xyz - position4.xyz ), 0. );
    gl_Position = pMatrix * position4;
}
