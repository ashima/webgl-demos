void map2Rpp(out vec4 P, out vec4 N, vec2 v) { /* plain */
    P = vec4(v.x,v.y,0.,1.);
    N = vec4(0.,0.,1.,1.);
}
