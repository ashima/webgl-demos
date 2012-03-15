/*
 * Description : A Gloc Demo module.
 *      Author : Ian McEwan, Ashima Arts.
 *     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
 *               Distributed under the MIT License. See LICENSE file.
 */

function ashimaGlocDemo() {
  var D = this;
  var awe = ashimaWebGLEngine0;

  //var gl, prog, verts, tris;
  var pi = 3.1415926535897932384626433832795029 ;
  var elemDemo, elemRoot, elemCanvas;
  var curW , curH ;
  //var mvMatrix, pMatrix;

  function makePerspective(fovy, aspect, near, far)
    { // swipped from somewhere!
    var tp = near * Math.tan(fovy * Math.PI / 360.0);
    var bt = -tp;
    var lt = bt * aspect;
    var rt = tp * aspect;
  
    var X =    2*near/(rt-lt);
    var Y =    2*near/(tp-bt);
    var A =  (rt+lt)/(rt-lt);
    var B =  (tp+bt)/(tp-bt);
    var C = -(far+near)/(far-near);
    var D = -2*far*near/(far-near);
  
    /*return [X, 0, A, 0,
            0, Y, B, 0,
            0, 0, C, D,
            0, 0,-1, 0 ] ;*/

    return [X, 0, 0, 0,
            0, Y, 0, 0,
            A, B, C, -1,
            0, 0, D, 0 ] ;
    } 

  function glinit() {
    gl = awe.getGlContext(elemCanvas,{});
  
    if (!gl)
      throw "No webgl here";
  
    var vs = "\
  const float pi = 3.1415926535897932384626433832795029 ; \
  attribute vec2 Rxy;                       \
  uniform mat4 pMatrix; \
  uniform mat4 mvMatrix;\
  varying vec2 tRxy;                    \
\
  vec4 map2Rto3P(vec2 v) { /* plain */ \
    return vec4(v.x,v.y,-1.0,1.);        \
    }                                  \
\
  vec4 map2Rto3Ps(in vec2 v) { /* sphere */ \
    v *= pi; \
    return vec4(cos(v.x)*cos(v.y),sin(v.x)*cos(v.y), sin(v.y)-1.9, 1.0);\
    }                                  \
\
  void main(void) {                       \
    tRxy = Rxy; \
    gl_Position = pMatrix *  mvMatrix * map2Rto3P(Rxy);  \
    /*gl_Position = vec4(Rxy, 1.0,1.0);*/\
    }";

    var fs = "#ifdef GL_ES\nprecision highp float;\n#endif\n\
  const float ipi = 1.0 / 3.1415926535897932384626433832795029 ; \
  uniform sampler2D tex0; \
  varying vec2 tRxy; \
  void main(void) { \
    /*gl_FragColor = texture2D(tex0, tRxy );*/ \
    gl_FragColor = vec4(abs(tRxy), 1.0,1.0 ); \
    }";
  
    prog = awe.compileAndLink(vs, fs);
    var num = 20;
    var step = 2 / num;
     jverts = new Array;
    for (var j = 0; j < num; j++ )
    for (var i = 0; i < num; i++ )
      {
      jverts[(j*num+i)*2+0] = i * step - 1.0;
      jverts[(j*num+i)*2+1] = j * step - 1.0;
      }
     jtris = new Array;
    for (var j = 0; j < num-1 ; j++ )
    for (var i = 0; i < num-1 ; i++ )
      {
      jtris[ (j*(num-1)+i)*6 +0] = (j+0)*num+(i+0) ;   
      jtris[ (j*(num-1)+i)*6 +1] = (j+0)*num+(i+1) ;   
      jtris[ (j*(num-1)+i)*6 +2] = (j+1)*num+(i+0) ;   
  
      jtris[ (j*(num-1)+i)*6 +3] = (j+0)*num+(i+1) ;   
      jtris[ (j*(num-1)+i)*6 +4] = (j+1)*num+(i+1) ;   
      jtris[ (j*(num-1)+i)*6 +5] = (j+1)*num+(i+0) ;   
      }
    verts = awe.makeBuffer(gl.ARRAY_BUFFER,gl.FLOAT,2,gl.STATIC_DRAW,jverts );
    tris = awe.makeBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.UNSIGNED_SHORT,3,gl.STATIC_DRAW,jtris );

    pMatrix = new Float32Array(makePerspective( 120, 1, 0.1, 10. ));
    mvMatrix = new Float32Array( [
      0.5,0.5,0,0, -0.5,0.5,0,0, 0,0,1,0, 0,0,0,1
      ]);
    }


  function renderinit()
    {
    demoTex = awe.textureCreate();
    demoTex.aweParams( gl.LINEAR, gl.LINEAR, gl.REPEAT, gl.CLAMP_TO_EDGE, false);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  
    prog.aweUse();
    demoTex.aweSet(0, prog.aweSym['tex0'] );
    verts.aweSetVertexAttPtr(prog.aweSym["Rxy"]);
    }
  
  
  function updateCanvasSize() {
    curW = elemRoot.clientWidth;
    curH = elemRoot.clientHeight;
    gl.viewport(0, 0, 
      gl.viewportWidth  = elemCanvas.width  = curW,
      gl.viewportHeight = elemCanvas.height = curH  );
    }
  
  function resizeNow()
    {
    updateCanvasSize();
    D.animator.play();
    }
  
  function render() {
    var w = elemRoot.clientWidth;
    var h = elemRoot.clientHeight;
  
    if (w != curW || h != curH) {
      D.animator.pause();
      setTimeout(resizeNow,200);
      }
    else
      {
      
      gl.uniformMatrix4fv(prog.aweSym["pMatrix"], false, pMatrix);
      gl.uniformMatrix4fv(prog.aweSym["mvMatrix"], false, mvMatrix);
      tris.drawElements(gl.TRIANGLES);
      }
    }
  
  D.updateCanvasSize = updateCanvasSize;
  //D.updateElems = updateElems;

  D.init = function(p) {
    elemRoot   = p;

    elemCanvas = document.createElement("canvas");
    elemCanvas.style.zIndex = -1;
    elemCanvas.style.position = "absolute";
    elemDemo = document.createElement("div");
    elemDemo.style.zIndex = 1;
    elemDemo.appendChild(elemCanvas);
    elemRoot.appendChild(elemDemo);

    glinit(); 
    renderinit();
    updateCanvasSize();
    D.animator = awe.animationStart(render,gl.canvas,1000/30,true);
    }

  var rendering = false;

};


