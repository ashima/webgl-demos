var run_main = false;
var main = function() { // namespace

var path_prefix = document.querySelector('nav').attributes['data-base-uri'].value;

var gif1x1 = "data:image/gif;base64,R0lGODlhAQABAJEAAP/Mmf/Mmf4BAgAAACH5BAQUAP8ALAAAAAABAAEAAAICRAEAOw==";

var zoomDelta = (1-1/16);
var zoom = 1.0;

var apv = new ashimaPanoViewer();

var addEvent = (document.addEventListener)
  ? function (e, v, f, c) { e.addEventListener(v,f,c); }
  : function (e, v, f)    { e.attachEvent("on"+v,f); }

var panos = document.querySelectorAll('.pano');
var subpath_els = document.querySelectorAll('*[data-uri]');

function showInfoOverlay(el) {
  var div = document.getElementById("panodiv");
  var info = el.cloneNode(true);
  info.className = "infoOverlay";
  var internal_links = info.querySelectorAll("a.internal");
  for (var i = 0; i < internal_links.length; i++) {
    addEvent(internal_links[i],"click",function(e) {
      e.preventDefault();
      pushPath(subpath_of_path(this.pathname))();
    },false);
  }
  div.appendChild(info);
}

function hideInfoOverlay() {
  var div = document.getElementById("panodiv");
  var infos = div.querySelectorAll(".infoOverlay");
  if (infos) for (var i = 0; i < infos.length; i++) {
    div.removeChild(infos[i]);
  }
}

function showLoadScreen() {
  var div = document.getElementById("panodiv");
  var loader = document.createElement("div");
  loader.className = "infoOverlay loadScreen";
  loader.innerText = document.getElementById("loadmsg").innerText;
  div.appendChild(loader);
  var timer = setInterval(function() {
      loader.innerText += ".";
  }, 200); // TODO: test spinner
  return {finish:function() {
      clearInterval(timer);
      div.removeChild(loader);
  }};
}

function showPano(i,subpath) {
  var link = document.getElementById(subpath);
  var href = path_prefix + link.attributes['href'].value;
  var img = new Image;
  img.src = gif1x1;
  return function() {
    for (var j = 0; j < panos.length; j++) {
      panos[j].className = "pano panoInAct";
    }
    subpath_els[i].className = "pano panoAct";

    zoom = 1.0;

    var spinner = showLoadScreen();
    img.onload = function(e) {
      spinner.finish();
      
      apv.setImage(img);
    };
    img.onerror = function() {
      showErrorScreen(); // TODO: check
    };
    var a_uri = document.createElement("a");
    a_uri.href = img.src;
    if (a_uri.pathname==href) img.onload();
    else img.src = href;
  };
}

function showCategory(i,subpath) {
  return function() { // TODO: check
    loadPath(constructPath(subpath_els[i].querySelector(".pano"),""));
    showInfoOverlay(subpath_els[i].querySelector(".index"));
  };
}

function showIndex() {
  return function() {
    loadPath(constructPath(document.querySelector(".pano"),""));
    showInfoOverlay(document.querySelector(".index"));
  };        
}

function constructPath(el, path_suffix) {
  var attr = el.attributes['data-uri'];
  if (attr) {
    return constructPath(el.parentNode,attr.value+"/"+path_suffix);
  } else {
    return path_suffix;
  }
}

var subpaths = {};
var subpath;
for (var i = 0; i < subpath_els.length; i++) {
  subpath = constructPath(subpath_els[i],"");
  subpaths[subpath] = {
      "category": function() { return showCategory(i,subpath); },
      "pano": function() { return showPano(i,subpath); }
  }[subpath_els[i].className]();
}

function loadPath(subpath) {
  hideInfoOverlay();

  if (subpath === "") showIndex()();
  else if (!(subpath in subpaths)) window.location = path_prefix;
  else subpaths[subpath]();
}

function pushPath(subpath) {
  return function() {
    loadPath(subpath);
    history.pushState({webgl:1,pano:1},"",path_prefix+subpath);
  };
}

function subpath_of_path(path) {
  var subpath_requested = "";
  for (var i = 0; i < path.length; i++) {
    if (i >= path_prefix.length || path[i] !== path_prefix[i])
      subpath_requested += path[i];
  }
  return subpath_requested;  
}

var old_window_onpopstate = window.onpopstate;
window.onpopstate = function (e) {
  if (e.state && e.state.pano==1) {
    loadPath(subpath_of_path(window.location.pathname));
  } else if (old_window_onpopstate) { old_window_onpopstate(e); }
};

function tryZoom(z) { 
  if (z < 1.9) { apv.setZoom(z); return z; }
  else return zoom;
  }
function zoomIn()  { zoom = tryZoom( zoom * zoomDelta) }
function zoomOut() { zoom = tryZoom( zoom / zoomDelta) }

return function() { // main
  if (!run_main) {
    var label,f,img;
    apv.init( document.getElementById("panodiv") );

    for (var i = 0; i < panos.length; i++) {
      var pano_path = constructPath(panos[i],"");
      addEvent(panos[i], "click", pushPath(pano_path), false);

      label = document.createTextNode(panos[i].querySelector('img').attributes['title'].value);
      panos[i].appendChild(label);
    }

    function zoomButton(e,f,dt) {
      var t = 0;
      function clear() {
        if (t) {
          clearTimeout(t); t = 0;
        }
      }
      addEvent( e, "mousedown", function() { t = setInterval(f,dt); f(); }, false);
      addEvent( e, "mouseup", clear, false);
      addEvent( e, "mouseout", clear, false);
      addEvent( e, "mouseleave", clear, false);
      addEvent( e, "blur", clear, false);
    }

    zoomButton( document.getElementById("bZoomIn"), zoomIn, 33 ) ;
    zoomButton( document.getElementById("bZoomOut"), zoomOut, 33 ) ;

    loadPath(subpath_of_path(window.location.pathname));
    history.replaceState({webgl:1,pano:1},"");

    run_main = true;
  } else {
    apv.updateElems();
    //apv.animator.play();
  }
}
}();

function pause() {
  //apv.animator.pause();
}
