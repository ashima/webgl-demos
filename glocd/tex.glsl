vec4 tex_(vec2 xy) {
   return texture2D(tex0, xy);
}

vec4 tex_noise(vec2 xy) {
   float t = time/1000.;
   vec4 tf = texture2D(tex0, xy);
   return vec4(tf.r*(0.2+snoise(vec3(xy,t)))/1.2,
	       tf.g*(0.2+snoise(vec3(xy.y,t,xy.x)))/1.2,
	       tf.b*(0.2+snoise(vec3(t,xy)))/1.2, 1.0);
}
