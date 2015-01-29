var Display = {};
(function (){
  "use strict";
  var Canvas, Pixel, ColourGenerator;
  /* Utilities */
  Display.genRandomColour = function () {
    /*one liner from http://www.paulirish.com/2009/random-hex-color-code-snippets/ */
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };
  /* ColourGenerator */
  ColourGenerator = Display.ColourGenerator = function () {
    //Factory pattern
    //Returns a function that will return the next hex color string in a sequence
    return (function(r,g,b) {
      //var r = 0, g = 0, b = 0;
      function to2Digits(n) {
        //assuming base 16
        var b = 16;
        return n >= b ? "" + n.toString(16) : "0" + n.toString(16);
      }
      function nextColour(inc) {
        inc = Number.parseInt(inc);
        //Create this colour string
        var colour = to2Digits(r)+to2Digits(g)+to2Digits(b);
        //Setup next color
        if (b >= 255) {
          b = 0;
          g += inc;
          if (g >= 255) {
            g = 0;
            r += inc;
            if (r >= 255) {
              r = 0;
            }
          }
        } else {
          b += inc;
        }
        return "#" + colour;
      }
      return function (inc) {
        if (!inc || inc === undefined || inc === 0) {
          inc = 1;
        }
        return nextColour(inc);
      };
    }(0,0,0));
  };
  /* Canvas */
  Canvas = Display.Canvas = function (w, h, uW, uH) {
    this.pixels = [];
    this.X = w; //number of "pixels"
    this.Y = h; //number of "pixels"
    this.unitWidth = uW;
    this.unitHeight = uH;
    this.element = document.createElement("div");
    this.element.classList.add("canvas");
    this.element.style.position = "absolute";
    this.element.style.top = "0";
    this.element.style.left = "0";
    this.element.style.width = "" + w * uW + "px";
    this.element.style.height = "" + h * uH + "px";
    this.newColour = new ColourGenerator(); //method
  };
  Canvas.prototype.clear = function (){
    var el = this.element;
    el.innerHTML = "";
    //or for(child in el) child.remove()
  };
  Canvas.prototype.populate = function (colourVariator) {
    var X, Y,
        x, y,
        pixel;
    X = this.X;
    Y = this.Y;
    for (x = 0; x < X; x += 1) {
      for (y = 0; y < Y; y += 1) {
        //Create a pixel for this location
        pixel = new Pixel(x, y, this.unitWidth, this.unitHeight);
        pixel.setColour(this.newColour(colourVariator));
        //pixel.setColour(Display.genRandomColour());
        this.placePixel(pixel);
      }
    }
    return this;
  };
  Canvas.prototype.placePixel = function (pixel) {
    if (!this.pixels[pixel.x]) {
      this.pixels[pixel.x] = [];
    }
    this.pixels[pixel.x][pixel.y] = pixel;
    this.element.appendChild(pixel.element);
  };
  /* Pixel */
  Pixel = Display.Pixel = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.element = document.createElement("div");
    this.element.classList.add("pixel");
    this.element.style.position = "absolute";
    this.element.style.top = "" + y*h + "px";
    this.element.style.left = "" + x*w + "px";
    //this.element.innerHTML = "" + x + "x" + y;
    this.element.style.width = "" + w + "px";
    this.element.style.height = "" + h + "px";
  };
  Pixel.prototype.setColour = function (colour) {
    this.colour = colour;
    console.log(colour);
    this.element.style.backgroundColor = colour;
  };

}());

var btn = document.createElement("button");
btn.innerText = "Generate image";
btn.style.position = "fixed";
btn.style.zIndex = "2";
btn.style.top = "0px";
btn.style.right = "0px";
document.body.appendChild(btn);
var nInput = document.createElement("input");
nInput.id = "n";
nInput.name = "n";
nInput.type = "text";
nInput.value = 256;
nInput.style.position = "fixed";
nInput.style.zIndex = "2";
nInput.style.top = "16px";
nInput.style.right = "0px";
nInput.style.width = "60px";
document.body.appendChild(nInput);
var nLabel = document.createElement("label");
nLabel.innerText = "n:";
nLabel.setAttribute("for", "n");
nLabel.style.position = "fixed";
nLabel.style.zIndex = "2";
nLabel.style.top = "16px";
nLabel.style.right = "60px";
document.body.appendChild(nLabel);
var vInput = document.createElement("input");
vInput.id = "v";
vInput.name = "v";
vInput.type = "text";
vInput.value = 5;
vInput.style.position = "fixed";
vInput.style.zIndex = "2";
vInput.style.top = "32px";
vInput.style.right = "0px";
vInput.style.width = "60px";
document.body.appendChild(vInput);
var vLabel = document.createElement("label");
vLabel.innerText = "v:";
vLabel.setAttribute("for", "v");
vLabel.style.position = "fixed";
vLabel.style.zIndex = "2";
vLabel.style.top = "32px";
vLabel.style.right = "60px";
document.body.appendChild(vLabel);
var cnv;
btn.addEventListener("click", function(e) {
  var promptMessage;
  var n = nInput.value;
  var colourVariator = vInput.value;
  if (cnv) {
    cnv.remove();
  }
  //Make sure the user wants to continue if n is big
  if (n > 100) {
    promptMessage = "You entered n=" + n + ". This may take a long time. Proceed?";
    if (!prompt(promptMessage)) {
      return false;
    }
  }
  cnv = new Display.Canvas(n,n, 1, 1).populate(colourVariator).element;
  //btn.remove();
  document.body.appendChild(cnv);
});