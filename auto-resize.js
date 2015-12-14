// auto-resize.js -- automatically adjusts the body style to match the window size
(function() {
  "use strict";
  /* I moved the MIN_W and MAX_W declarations to the resize function so that they
  don't take up (negligible) memory while the resize function isn't executing. Not
  sure which approach would be better. */
  /*
  var MIN_W = 320;
  var MAX_W = 980;
  */
  /*resize: EventHandler -- Resizes body to the full width of the viewport */
  function resize(e) {
    var w, h;
    
    var MIN_W = 320;
    var MAX_W = 980;
    
    // Getting current viewport dimensions
    w = window.innerWidth;
    h = window.innerHeight;
    
    if (w <= MIN_W) w = MIN_W;
    else if (w >= MAX_W) w = MAX_W;
  
  	document.body.style.width=w+"px";
  	document.body.style.height=h+"px";
  }
  
  document.addEventListener("DOMContentLoaded", resize);
  window.addEventListener("resize", resize);
})();