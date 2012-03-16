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
  theta = 0.;
  phi = 0.;
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
\
  attribute vec2 position2D;                       \
  vec4 P,N; \
  void map2Rto3P() { /* plain */ \
    P = vec4(position2D.x,position2D.y,0.,1.);        \
    N = vec4(0.,0.,1.,1.); \
    }                                  \
\
  void map2Rto3Ps() { /* sphere */ \
    vec2 v = position2D * pi; \
    P = vec4(cos(v.x)*sin(v.y), sin(v.x)*sin(v.y), cos(v.y), 1.0);\
    N = P;\
    }                                  \
\
  uniform mat4 pMatrix; \
  uniform mat4 mvMatrix;\
\
  varying vec4 normal; \
  varying vec2 texCoord;                    \
\
  void main(void) {                       \
    map2Rto3P(); \
    texCoord = position2D; \
    normal = N;\
   \
    gl_Position = pMatrix *  (P*mvMatrix  - vec4(0.,0.,4,0.));  \
    /*gl_Position = vec4(Rxy, 1.0,1.0);*/\
    }";

    var fs = "#ifdef GL_ES\nprecision highp float;\n#endif\n\
  const float ipi = 1.0 / 3.1415926535897932384626433832795029 ; \
  uniform sampler2D tex0; \
  varying vec2 texCoord; \
  varying vec4 normal; \
  void main(void) { \
    /*gl_FragColor = texture2D(tex0, tRxy );*/ \
    gl_FragColor = vec4(abs(texCoord), 1.0,1.0 ); \
    }";
  
    prog = awe.compileAndLink(vs, fs);
    var num = 40;
    var step = 2 / (num-1);
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

    }


  function renderinit()
    {
    demoTex = awe.textureCreate();
    demoTex.aweParams( gl.LINEAR, gl.LINEAR, gl.REPEAT, gl.CLAMP_TO_EDGE, false);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  
    prog.aweUse();
    demoTex.aweSet(0, prog.aweSym['tex0'] );
    verts.aweSetVertexAttPtr(prog.aweSym["position2D"]);
    }
  
  
  function updateCanvasSize() {
    curW = elemRoot.clientWidth;
    curH = elemRoot.clientHeight;
    pMatrix = new Float32Array(makePerspective( 45, curW/curH, 2, 10. ));
    gl.viewport(0, 0, 
      gl.viewportWidth  = elemCanvas.width  = curW,
      gl.viewportHeight = elemCanvas.height = curH  );
    }
  
  function resizeNow()
    {
    updateCanvasSize();
    D.animator.play();
    }
 
  function clearFrame()
    {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    } 

  function render() {
    var w = elemRoot.clientWidth;
    var h = elemRoot.clientHeight;
    phi += pi / 90;  
    if (w != curW || h != curH) {
      D.animator.pause();
      setTimeout(resizeNow,200);
      }
    else
      {
      clearFrame();  
      ct = Math.cos(theta); st = Math.sin(theta);
      cp = Math.cos(phi);   sp = Math.sin(phi);

      /*mvMatrix = new Float32Array( [
      ct*cp, -sp, st*cp, 0,
      ct*sp,  cp, st*sp, 0,
      -st,    0,  ct,    0,
      0,      0,  0,     1.0 ] );*/
      mvMatrix = new Float32Array( [
      cp, -sp, 0, 0,
      ct*sp, ct*cp ,-st , 0,
      st*sp, st*cp, ct, 0,
      0,      0,  0,     1.0 ] );

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

    theta = -1.0;
    phi = 0;
    }

  var rendering = false;

};


