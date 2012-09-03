var run_main = false;
var main_pause = function() { // namespace

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
  info.className += " infoOverlay";
  var internal_links = info.querySelectorAll("a.internal");
  for (var i = 0; i < internal_links.length; i++) {
    addEvent(internal_links[i],"click",function(e) {
      e.preventDefault();
      pushPath(subpath_of_path(this.pathname))();
    },false);
  }
  div.appendChild(info);

  return info;
}

function hideInfoOverlay() {
  var div = document.getElementById("panodiv");
  var infos = div.querySelectorAll(".infoOverlay");
  if (infos) for (var i = 0; i < infos.length; i++) {
    div.removeChild(infos[i]);
  }
}

function showErrorStatus() {
  showInfoOverlay(document.getElementById("errormsg"));
}

function showLoadStatus() {
  var loader = showInfoOverlay(document.getElementById("loadmsg"));
  var timer = setInterval(function() {
      loader.innerText += ".";
  }, 200); // TODO: test spinner
  return {finish:function() {
      clearInterval(timer);
      loader.parentNode.removeChild(loader);
  }};
}

apv.onPanoStop = function(az, el) {
  history.replaceState({webgl:1},"","#?az="+az+"&el="+el);
}

function normHash(h) {
  var hfqp = {az: 0, el: 0};
  var q = h.substr(2);
  var kvp = q.split("&");
  if ("#?" == h.substr(0,2)) {
    for (var i = 0; i < kvp.length; i++) {
      kvp[i] = kvp[i].split("=");
      hfqp[kvp[i][0]] = parseFloat(kvp[i][1]);
    }

    history.replaceState({webgl:1},"","#?az="+hfqp.az+"&el="+hfqp.el);
  }
  return hfqp;
}

function showPano(i,subpath) {
  var link = document.getElementById(subpath);
  var href = link.attributes['href'].value;
  var img = new Image;
  var error = false;
  img.src = gif1x1;
  return function() {
    for (var j = 0; j < panos.length; j++) {
      panos[j].className = "pano panoInAct";
    }
    subpath_els[i].className = "pano panoAct";

    zoom = 1.0;

    var spinner = showLoadStatus();
    img.onload = function(e) {
      var panoCoord = normHash(window.location.hash);
      spinner.finish();
      
      apv.setView(panoCoord.az,panoCoord.el);
      apv.setImage(img);
    };
    img.onerror = function() {
      spinner.finish();
      showErrorStatus();
      error = true;
    };
    var a_uri = document.createElement("a");
    a_uri.href = img.src;
    if (a_uri.pathname==href && !error) img.onload();
    else if (error) img.onerror();
    else img.src = href;
  };
}

function showSection(i,subpath) {
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
      "section": function() { return showSection(i,subpath); },
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
    history.pushState({webgl:1},"",path_prefix+subpath);
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

function tryZoom(z) { 
  if (z < 1.9) { apv.setZoom(z); return z; }
  else return zoom;
  }
function zoomIn()  { zoom = tryZoom( zoom * zoomDelta) }
function zoomOut() { zoom = tryZoom( zoom / zoomDelta) }

return [function() { // main
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
    history.replaceState({webgl:1},"");

    run_main = true;
  } else {
    loadPath(subpath_of_path(window.location.pathname));
    apv.updateElems();
    apv.animator.play();
  }
},
function() { // pause
  apv.animator.pause();
}];
}();

main = main_pause[0];
pause = main_pause[1];
