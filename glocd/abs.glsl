vec4 abs_(vec2 xy) {
  return vec4(abs(xy),1.0,1.0);
}

vec4 abs_noise(vec2 xy) {
  float t = time/1000.;
  return vec4((0.2+snoise(vec3(xy,t)))/1.2,
	      (0.2+snoise(vec3(xy.y,t,xy.x)))/1.2,
	      (0.2+snoise(vec3(t,xy)))/1.2,1.0);
}
