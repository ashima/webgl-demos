const float ipi = 1.0 / 3.1415926535897932384626433832795029;
uniform sampler2D tex0;
uniform float time;
uniform float mixf;

varying vec2 texCoord;
varying vec4 normal;
varying vec4 pointLightingDirection;

uniform vec4 ambientColor;
uniform vec4 directionalColor;
uniform vec4 lightingDirection;
uniform vec4 pointLightingColor;

void main(void) {
    vec4 lt_att = light(vec4(0.));
    gl_FragColor = lt_att * mix(blenda(texCoord),blendb(texCoord),mixf);
}
