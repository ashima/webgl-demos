/*
 * Description : Simple Panorama Viewing module.
 *      Author : Ian McEwan, Ashima Arts.
 *     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
 *               Distributed under the MIT License. See LICENSE file.
 */

function ashimaPanoViewer() {
var P = this;
var awe = ashimaWebGLEngine0;

var gl, prog, verts, panoTex, panoStopTimer;
var pi = 3.1415926535897932384626433832795029 ;
var elemPan, elemRoot, elemCanvas;
var zoom = 1.0;
var saspect = 8 /2;
var panoStopDelay = 500;

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

var el = 0;
var az = 0;
var prev_el = null;
var prev_az = null;
curW = 0;
curH = 0;
wrap = 4;
function updateElems() {
  curW = elemRoot.clientWidth;
  curH = elemRoot.clientHeight;

  elemPan.style.width = curW * 2/ zoom + wrap ;
  elemPan.style.height = curH * 2/(zoom *saspect);
  elemRoot.scrollLeft = az * (elemPan.offsetWidth - curW-wrap) / (2*pi)+wrap/2;
  elemRoot.scrollTop  =  (-el*saspect / pi + 0.5) * (elemPan.offsetHeight - curH) ;
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

  az = 2* pi * ( elemRoot.scrollLeft-wrap/2)/(elemPan.offsetWidth - w - wrap);
  el = (1/saspect)* -pi * (elemRoot.scrollTop/(elemPan.offsetHeight - h)-0.5);
  if (az > 2*pi) {
    az -= 2*pi;
    updateElems();
    }

  if (az < 0) {
    az += 2*pi;
    updateElems();
    }
  if (w != curW || h != curH) {
    P.animator.pause();
    setTimeout(resizeNow,200);
    }
  else if (el != prev_el || az != prev_az)
    {
    var ce = Math.cos(el),  se = Math.sin(el);
    var ca = Math.cos(az),  sa = Math.sin(az);
  
    var trans = [ ca, -sa*se, sa*ce,   0, ce, se,   sa, se*ca, -ca*ce ];
  
    var z_dist = 1.0;
  
    gl.uniform3f(prog.aweSym["z"], z_dist, h/w, zoom);
    gl.uniform2f(prog.aweSym["sas"], saspect, 0);
    gl.uniformMatrix3fv(prog.aweSym["trans"], false,trans);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,verts.aweNumItems);

    prev_el = el; prev_az = az;
    clearTimeout(panoStopTimer);
    panoStopTimer = setTimeout(P.onPanoStop,panoStopDelay,az,el,zoom);
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
  };

  P.setImage = function(i) {
    var iw = i.naturalWidth,
        ih = i.naturalHeight;
    saspect = (iw / ih) *0.5 ;
    panoTex.aweFromElem(i);
    zoom = 1 / saspect;
    prev_el = prev_az = null;
    resizeNow();
  };
  P.setZoom = function(_z) {
    zoom = _z;
    updateElems();
  };
  P.setView = function(az_,el_) {
    el = el_;
    az = az_;
  };
  P.onPanoStop = function(az,el,z) { }
};
