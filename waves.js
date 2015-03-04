(function () {
  "use strict";
  /*global Cel*/
  var canvas, ctx,
    xAxis, yAxis,
    unit = 100;
  canvas = new Cel({type: "canvas", id: "waves"});
  canvas.height = "200";
  canvas.width = "200";
  document.body.appendChild(canvas);
  
  ctx = canvas.getContext("2d");
  ctx.strokeStyle = "#000";
  xAxis = Math.floor(canvas.height / 2);
  yAxis = Math.floor(canvas.width / 4);
  
  function drawSine(t) {
    var x, y, i;
    x = t;
    y = Math.sin(x);
    
    ctx.moveTo(yAxis, unit * y + xAxis);
    
    for (i = yAxis; i <= canvas.width; i += 70) {
      x = t + (-yAxis + 1) / unit;
      y = Math.sin(x);
      ctx.lineTo(i, unit * y + xAxis);
    }
  }
  
  drawSine(30);
}());