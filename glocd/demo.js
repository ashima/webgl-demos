/*
 * Copyright 2012 Ashima Arts <http://ashimaarts.com/> All rights reserved.
 *     License: MIT expat <../LICENSE>
 *      Author: Ian McEwan, Ashima Arts
 *      Author: David Sheets, Ashima Arts
 * Description: A gloc demo module
 */

function ashimaGlocDemo(onprogress, onprogchange) {
  var D = this;
  var awe = ashimaWebGLEngine0;
  var epoch = (new Date()).getTime();

  var vcycle = ["map2Rs","map2Rpp","map2Rnp","map2Rns"];
  var fcycle = ["tex_","abs_","abs_noise","tex_noise"];
  var vtrans = 7000.;
  var ftrans = 3000.;
  var currentvi = 0, currentfi = 0;
  function ready_for_switch() {
      var now = (new Date()).getTime() - epoch;
      var vi = Math.floor((now/vtrans) % vcycle.length);
      var fi = Math.floor((now/ftrans) % fcycle.length);
      var ovi = currentvi, ofi = currentfi;
      currentvi=vi; currentfi=fi;
      return (ovi != vi) || (ofi != fi);
  }
  var prog_cache = {};
  function make_progs(callback) {
      var total = vcycle.length * fcycle.length;
      var complete = 0;
      for (var vi = 0; vi < vcycle.length; vi++) {
	  for (var fi = 0; fi < fcycle.length; fi++) {
	      (function() {
	      var av, bv, af, bf;
	      av = vcycle[vi]; bv = vcycle[(vi + 1) % vcycle.length];
	      af = fcycle[fi]; bf = fcycle[(fi + 1) % fcycle.length];
	      get_glo(["vert.glo",
		       make_blend(av,bv),
		       "sphere.glo",
		       "plain.glo",
		       "nplain.glo",
		       "noise.glo"],
		      ["blend.glo",
		       make_blend(af,bf),
		       make_light(["point_light","ambient_light"]),
		       "abs.glo",
		       "tex.glo",
		       "light.glo",
		       "noise.glo"],
		      function (vglom, fglom) {
			  if (!( av in prog_cache)) prog_cache[av] = {};
			  prog_cache[av][af] = link_prog(vglom,fglom);
			  complete++;
			  onprogress(complete,av,af);
			  if (total == complete) callback();
		      });
	      })();
	  }
      }
  }
  function get_prog() {
      var now = (new Date()).getTime() - epoch;
      var vi = Math.floor((now/vtrans) % vcycle.length);
      var fi = Math.floor((now/ftrans) % fcycle.length);
      onprogchange(vi,fi);
      return prog_cache[vcycle[vi]][fcycle[fi]];
  }

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

  var precdecl = "#ifdef GL_ES\nprecision highp float;\n#endif\n";
  var glol = new GLOL();

  function link_prog(vglom,fglom) {
    var vs;
    try { vs = glol.link(precdecl,[],vglom) }
    catch(e) { console.log(e); };
    var fs;
    try { fs = glol.link(precdecl,[],fglom) }
    catch(e) { console.log(e); };
      
    r = awe.compileAndLink(vs,fs);
    return r;
    }

  function use_prog() {
    prog.aweUse();
    demoTex.aweSet(0, prog.aweSym['tex0'] );
    verts.aweSetVertexAttPtr(prog.aweSym["position2D"]);
    }

    function make_blend(a,b) {
	return [a+"2"+b,
		{"glo": [1,0,0],
		 "target": ["webgl",[1,0,0]],
		 "units":[
		     {"insym": [a],
		      "outmac": ["blenda"],
		      "source":"#define blenda "+a},
		     {"insym": [b],
		      "outmac": ["blendb"],
		      "source":"#define blendb "+b}
		 ]
		}
	       ];
    }
    function make_light(a) {
	var compose = a.join("(")+"(c"+a.map(function(k){ return ""; }).join(")")+")";
	return [a.join("_"),
		{"glo": [1,0,0],
		 "target": ["webgl",[1,0,0]],
		 "units":[
		     {"insym": a,
		      "outmac": ["light"],
		      "source":"#define light(c) "+compose }
		 ]
		}
	       ];
    }
    
    var glo_cache = {};
    
    function get_glo(vpaths,fpaths,callback) {
	var complete = vpaths.length+fpaths.length;
	var progress = 0;
	function error() {
	    throw ("Error requesting '"+path+"'.");
	}
	function got_glo(path,set_path) {
	    progress++;
	    set_path(path,[path,glo_cache[path]]);
	    if (progress == complete) { callback(vpaths,fpaths); }
	}
	function request_path(path,set_path) {
	    if ( Object.prototype.toString.call(path) === "[object Array]") {
		glo_cache[path[0]] = path[1];
		got_glo(path[0],set_path);
		return;
	    }
	    if (path in glo_cache) { got_glo(path,set_path); return; }
	    var req = new XMLHttpRequest();
	    
	    req.onerror = req.onabort = error;
	    
	    req.onreadystatechange = function() {
		if (req.readyState == 4) {
		    if (req.responseText == null) error();
		    else {
			glo_cache[path] = JSON.parse(req.responseText);
			got_glo(path,set_path);
		    }
		}
	    };
	    req.open("GET",path);
	    
	    try { req.send(); }
            catch (x) {
		throw ("File exception caught requesting "+s+" :\n'"+x.toString()+"'");
		return true;
            }
	}

	vpaths.forEach(function (path) {
	    request_path(path,
			 function(p,v) {
			     vpaths[vpaths.indexOf(p)] = v;
			 });
	});
	fpaths.forEach(function (path) {
	    request_path(path,
			 function(p,v) {
			     fpaths[fpaths.indexOf(p)] = v;
			 });
	});
    }

  function glinit() {
    gl = awe.getGlContext(elemCanvas,{"warningsAsErrors":true});
      
    if (!gl) throw "No webgl here"; 
	    
    var num = 20;
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
	    
    pMatrix = new Float32Array(makePerspective( 120, 1, 0.1, 10. ));
    mvMatrix = new Float32Array([0.5,0.5,0,0, -0.5,0.5,0,0, 0,0,1,0, 0,0,0,1]);
    }

  var demoTex, demoImg;
  function renderinit()
    {
    demoTex = awe.textureCreate();
    demoImg = new Image ;
    demoImg.onload = function() {
      demoTex.aweFromElem(demoImg);
      demoTex.aweParams( gl.LINEAR, gl.LINEAR,
			 gl.REPEAT, gl.REPEAT, false);
      }
    demoImg.onerror = function(e) { console.log(e); };
    demoImg.src = "Stone1.jpg";
    }

  function updateCanvasSize() {
    curW = elemRoot.clientWidth;
    curH = elemRoot.clientHeight;
      pMatrix = new Float32Array(makePerspective(45, curW/curH, 2, 10.));
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
    gl.clearColor(0.0,0.0,0.0,1.0);
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
    var now = (new Date()).getTime()-epoch;

    phi += pi / 240;
    if (w != curW || h != curH) {
      D.animator.pause();
      setTimeout(resizeNow,200);
      }
    else {
      ct = Math.cos(theta); st = Math.sin(theta);
      cp = Math.cos(phi);   sp = Math.sin(phi);

      mvMatrix = new Float32Array([ cp,    -sp,   0,   0,
                                    ct*sp, ct*cp, -st, 0,
                                    st*sp, st*cp, ct,  0,
                                    0,     0,     0,   1.0]);

      if (ready_for_switch())
        prog = get_prog();
      
      use_prog();
      clearFrame();
      gl.uniformMatrix4fv(prog.aweSym["pMatrix"], false, pMatrix);
      gl.uniformMatrix4fv(prog.aweSym["mvMatrix"], false, mvMatrix);
      gl.uniform1f(prog.aweSym["time"], now);
      var sv = (now % vtrans) / vtrans;
      var sf = (now % ftrans) / ftrans;
      gl.uniform1f(prog.aweSym["mixv"], 3*Math.pow(sv,2) - 2*Math.pow(sv,3));
      gl.uniform1f(prog.aweSym["mixf"], 3*Math.pow(sf,2) - 2*Math.pow(sf,3));

      gl.uniform4fv(prog.aweSym["ambientColor"], [0.1,0.1,0.1,1.0]);
      gl.uniform4fv(prog.aweSym["directionalColor"], [0.9,0.9,0.9,1.0]);
      gl.uniform4fv(prog.aweSym["lightingDirection"],
		    [sp*cp+cp*sp,1.0,cp*cp-sp*sp,1.0]);
      gl.uniform4fv(prog.aweSym["pointLightingColor"], [0.9,0.9,0.9,1.]);
      gl.uniform4fv(prog.aweSym["pointLightingLocation"], [10.0,10.0,10.0,1.0]);

      tris.drawElements(gl.TRIANGLES);
      }
    }
  D.updateCanvasSize = updateCanvasSize;
  //D.updateElems = updateElems;

  D.init = function(p, callback) {
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
    make_progs(function() { prog = get_prog(); callback(); } );
    D.animator = awe.animationStart(render,gl.canvas,1000/60,true);
    theta = -1.0;
    phi = 0;
    }
  };


