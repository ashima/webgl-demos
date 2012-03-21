vec4 ambient_light(vec4 c) {
    return c + ambientColor;
}

vec4 diffuse_light(vec4 c) {
    return c + directionalColor * max(dot(normal, lightingDirection),0.);
}

vec4 point_light(vec4 c) {
    return c + pointLightingColor * max(dot(normal, pointLightingDirection),0.);
}

vec4 null_light(vec4 c) {
     return vec4(1.0);
}
