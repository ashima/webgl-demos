/*
 * Description : Simple Panorama Viewing module.
 *      Author : Ian McEwan, Ashima Arts.
 *     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
 *               Distributed under the MIT License. See LICENSE file.
 */

function ashimaPanoViewer() {
var P = this;
var awe = ashimaWebGLEngine0;

var gl, prog, verts, panoTex;
var pi = 3.1415926535897932384626433832795029 ;
var elemPan, elemRoot, elemCanvas;
var zoom = 1.0;
var saspect = 8 /2;

function glinit() {
  gl = awe.getGlContext(elemCanvas,{});

  if (!gl)
    throw "No webgl here";

  var vs = "\
    attribute vec2 p;                       \
    uniform   vec3 z;                       \
    varying   vec3 fpos;                    \
    void main(void) {                       \
      fpos = vec3(p*z.z, z.x);                  \
      fpos.y *= z.y;                        \
      gl_Position = vec4(p.x,p.y,z.x,1.0);  \
      }";

  var fs = "#ifdef GL_ES\nprecision highp float;\n#endif\n\
    const float ipi = 1.0 / 3.1415926535897932384626433832795029 ; \
    uniform sampler2D pan; \
    uniform mat3 trans; \
    uniform vec2 sas; \
    varying vec3 fpos; \
    void main(void) { \
      vec3 q = normalize(fpos) * trans ; \
      vec2 l = vec2( atan(q.z,q.x) * 0.5, sas.y-asin(q.y)*sas.x) * ipi ; \
      l.y += 0.5; \
      gl_FragColor = texture2D(pan, l.xy ); \
      }";


  prog = awe.compileAndLink(vs, fs);

  verts = awe.makeBuffer(gl.ARRAY_BUFFER,gl.FLOAT,2,gl.STATIC_DRAW,
    [ -1.,-1.,  1.,-1.,  -1.,1.,  1.,1. ] );

  }

function renderinit()
  {
  panoTex = awe.textureCreate();
  panoTex.aweParams( gl.LINEAR, gl.LINEAR, gl.REPEAT, gl.CLAMP_TO_EDGE, false);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  prog.aweUse();
  panoTex.aweSet(0, prog.aweSym['pan'] );
  verts.aweSetVertexAttPtr(prog.aweSym["p"]);
  }

//var curW, curH, lat=0, lon=0;
lat = 0;
lon = 0;
prev_lat = null;
prev_lon = null;
curW = 0;
curH = 0;
wrap = 4;
function updateElems() {
  curW = elemRoot.clientWidth;
  curH = elemRoot.clientHeight;

  elemPan.style.width = curW * 2/ zoom + wrap ;
  elemPan.style.height = curH * 2/(zoom *saspect);
  elemRoot.scrollLeft = lon * (elemPan.offsetWidth - curW-wrap) / (2*pi)+wrap/2;
  elemRoot.scrollTop  =  (-lat*saspect / pi + 0.5) * (elemPan.offsetHeight - curH) ;
  }

function updateCanvasSize() {
  gl.viewport(0, 0,
    gl.viewportWidth  = elemCanvas.width  = curW,
    gl.viewportHeight = elemCanvas.height = curH  );
  }

function resizeNow()
  {
  updateElems();
  updateCanvasSize();
  P.animator.play();
  }

function render() {
  var w = elemRoot.clientWidth;
  var h = elemRoot.clientHeight;

  lon = 2* pi * ( elemRoot.scrollLeft-wrap/2)/(elemPan.offsetWidth - w - wrap);
  lat = (1/saspect)* -pi * (elemRoot.scrollTop/(elemPan.offsetHeight - h)-0.5);
  if (lon > 2*pi) {
    lon -= 2*pi;
    updateElems();
    }

  if (lon < 0) {
    lon += 2*pi;
    updateElems();
    }
  if (w != curW || h != curH) {
    P.animator.pause();
    setTimeout(resizeNow,200);
    }
  else if (lat != prev_lat || lon != prev_lon)
    {
    var ca = Math.cos(lat),  sa = Math.sin(lat);
    var co = Math.cos(lon),  so = Math.sin(lon);
  
    var trans = [ co, -so*sa, so*ca,   0, ca, sa,   so, sa*co, -co*ca ];
  
    var z_dist = 1.0;
  
    gl.uniform3f(prog.aweSym["z"], z_dist, h/w, zoom);
    gl.uniform2f(prog.aweSym["sas"], saspect, 0);
    gl.uniformMatrix3fv(prog.aweSym["trans"], false,trans);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,verts.aweNumItems);

    prev_lat = lat; prev_lon = lon;
    }
  }

  P.updateCanvasSize = updateCanvasSize;
  P.updateElems = updateElems;

  P.init = function(p) {
    elemRoot   = p;

    elemCanvas = document.createElement("canvas");
    elemCanvas.style.zIndex = -1;
    elemCanvas.style.position = "absolute";
    elemPan = document.createElement("div");
    elemPan.style.zIndex = 1;
    elemPan.appendChild(elemCanvas);
    elemRoot.appendChild(elemPan);

    glinit(); 
    renderinit();
    updateElems();
    updateCanvasSize();
    P.animator = awe.animationStart(render,gl.canvas,1000/30,true);
    }

  P.setImage = function(i) {
    var iw = i.naturalWidth,
        ih = i.naturalHeight;
    saspect = (iw / ih) *0.5 ;
    panoTex.aweFromElem(i);
    zoom = 1 / saspect;
    prev_lat = prev_lon = null;
    resizeNow();
    }
  P.setZoom = function(_z) {
    zoom = _z;
    updateElems();
    }

};


