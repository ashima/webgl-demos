void map2Rnp(out vec4 P, out vec4 N, vec2 v) { /* plain */
    P = vec4(v.x,v.y,-1.0-snoise(vec3(v,time/1000.))/10.,1.);
    N = vec4(0.,0.,1.,1.);
}
