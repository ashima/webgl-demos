void map2Rs(out vec4 P, out vec4 N, vec2 v) { /* sphere */
    v *= pi;
    P = vec4(cos(v.x)*sin(v.y),sin(v.x)*sin(v.y), cos(v.y),1.0);
    N = normalize(P);
}

void map2Rns(out vec4 P, out vec4 N, vec2 v) {
    v *= pi;
    float t = time/1000.;
    vec3 s = vec3(cos(v.x)*sin(v.y),sin(v.x)*sin(v.y),cos(v.y));
    P = vec4((2.+snoise(vec3(v,t)))*s/2.5,1.0);
    N = normalize(P);
}
