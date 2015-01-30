var Display = {};
(function (){
  "use strict";
  var Canvas, Pixel, ColourGenerator;
  /* Utilities */
  Display.genRandomColour = function () {
    /*one liner from http://www.paulirish.com/2009/random-hex-color-code-snippets/ */
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };
  Display.storage = (function () {
    var key = "canvases";
    var get = function(id) {
      var storage = JSON.parse(window.localStorage.getItem(key));
      if (storage === null) {
        window.localStorage.setItem(key, "{}");
        storage = JSON.parse(window.localStorage.getItem(key));
      }
      return storage[id];
    };
    var set = function(id, value) {
      var storage = JSON.parse(window.localStorage.getItem(key));
      if (storage === null) {
        window.localStorage.setItem(key, "{}");
        storage = JSON.parse(window.localStorage.getItem(key));
      }
      storage[id] = value;
      try {
      window.localStorage.setItem(key, JSON.stringify(storage));
      } catch(err) {
        console.log("Error saving item to LS!");
      }
    };
    return {
      get: get,
      set: set
    };
  }());
  /* ColourGenerator */
  ColourGenerator = Display.ColourGenerator = function () {
    var colours = [];
    //Factory pattern
    //Returns a function that will return the next hex color string in a sequence
    return (function(r,g,b) {
      //var r = 0, g = 0, b = 0;
      function to2Digits(n) {
        //assuming base 16
        var num;
        if (n > 255) {
          if (n < 0) {
            n *= -1;
          }
          n = n % 256;
        }
        num = n.toString(16);
        if (num.length != 2) {
          num = "0" + num;
        }
        if (num.length != 2) {
          console.log("Erroneous n: " + num);
          num = "00";
        }
        return num;
      }
      function hexString(r, g, b) {
        return "#" + to2Digits(r)+to2Digits(g)+to2Digits(b);
      }
      function nextColour(inc) {
        var colour;
        //we will be saving this colour to an array
        if (!colours[r]) {
          colours[r] = [];
        }
        if (!colours[r][g]) {
          colours[r][g] = [];
        }
        if (!colours[r][g][b]) {
          //Make colour
          colours[r][g][b] = hexString(r,g,b);
        } else {
          //Use existing colour
          console.log("existing colour");
        }
        colour = colours[r][g][b];
        //Setup next color
        inc = Number.parseInt(inc);
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
        return colour;
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
        pixel,
        that;
    X = this.X;
    Y = this.Y;
    that = this;
    for (x = 0; x < X; x += 1) {
      for (y = 0; y < Y; y += 1) {
        //Create a pixel for this location
        pixel = new Pixel(x, y, this.unitWidth, this.unitHeight);
        pixel.setColour(this.newColour(colourVariator));
        //pixel.setColour(Display.genRandomColour());
        this.placePixel(pixel);
        /*
        window.setTimeout((function(pixel) {
          return function() {
            that.placePixel(pixel);
          };
        }(pixel)), Math.random() * 0.3);
        */
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
    this.element.style.backgroundColor = colour;
  };

}());
//Ui box
var ui = document.createElement("div");
ui.style.position = "fixed";
ui.style.zIndex = "2";
ui.style.top = "0px";
ui.style.right = "0px";
//How-to dialogue
var info = document.createElement("div");
ui.appendChild(info);
info.innerHTML = "<h3>Colour Block Generator</h3>";
info.innerHTML += "<p>I don't know quite what this is yet.</p>";
info.innerHTML += "<p>This produces an <b>n</b>x<b>n</b> pixel image, where <b>v</b> is the variance of colour between each adjacent pixel</p>";
info.innerHTML += "<h4>In short:</h4><p>Enter a <i>low</i> n (try around 30-40). Now, try v, where 0 < v < 256.</p>";
info.innerHTML += "<p> <i>Uses <a href='http://html2canvas.hertzen.com/'>html2canvas</a> and a whole lotta divs</i></p>";
info.style.width = "150px";
//Button to generate the image
var btn = document.createElement("button");
btn.innerText = "Generate image";
ui.appendChild(btn);
//n (x and y dimensions) label
var nLabel = document.createElement("label");
nLabel.innerText = "n:";
nLabel.setAttribute("for", "n");
ui.appendChild(nLabel);
//n (x and y dimensions) input
var nInput = document.createElement("input");
nInput.id = "n";
nInput.name = "n";
nInput.type = "text";
nInput.value = 40;
nInput.style.width = "60px";
ui.appendChild(nInput);
//Variance label
var vLabel = document.createElement("label");
vLabel.innerText = "v:";
vLabel.setAttribute("for", "v");
ui.appendChild(vLabel);
//Variance input
var vInput = document.createElement("input");
vInput.id = "v";
vInput.name = "v";
vInput.type = "text";
vInput.value = 11;
vInput.style.width = "60px";
ui.appendChild(vInput);
//unitWidth & unitHeight: TODO
var uwInput, uwLabel;
uwInput = document.createElement("input");
uwLabel = document.createElement("label");
uwInput.value = 1;
uwLabel.innerText="uW";
//Now add ui to document.body
document.body.appendChild(ui);
var cnvs, cnv, screenshot = {};
var dim;
var loadingMessage = document.createElement("p");
loadingMessage.innerHTML = "Loading...";
cnvs = document.createElement("div");
cnvs.style.position = "absolute";
cnvs.style.top = "0px";
cnvs.style.left = "0px";
document.body.appendChild(cnvs);
btn.addEventListener("click", function(e) {
  var promptMessage;
  var n = nInput.value;
  var colourVariator = vInput.value;
  //Make sure the user wants to continue if n is big
  if (n > 100) {
    promptMessage = "You entered n=" + n + ". This may take a long time. Proceed?";
    if (!confirm(promptMessage)) {
      return false;
    }
  }
  //Hide ui elements
  ui.style.display = "none";
  //Show loading message
  document.body.appendChild(loadingMessage);
  //Show all 1x1 -> nxn canvases
  var bigX = 0, bigY = 0, bigUW = 0, bigUH = 0;
  function newCanvas(x, y, uw, uh, v) {
    v = v < 0 ? (-1)*v : v;
    bigX = x > bigX ? x : bigX;
    bigY = y > bigY ? y : bigY;
    bigUW = uw > bigUW ? uw : bigUW;
    bigUH = uh > bigUH ? uh : bigUH;
    var cnv;
    //Clear the previous picture from the document
    /*if (screenshot.canvas) {
          screenshot.canvas.remove();
          delete screenshot.canvas;
    }*/
    var saved = Display.storage.get("x"+x+"y"+y+"v"+v);
    if (saved) {
      var img = new Image();
      img.src = saved;
      img.style.position = "absolute";
      img.style.top = "0px";
      img.style.top = "0px";
      cnvs.appendChild(img);
      img.onload = function(e) {
        newCanvas(x - 1, y - 1, uw, uw, v);
      };
    } else {
      window.setTimeout(function() {
        if (x > 1 && y > 1) {
          cnv = new Display.Canvas(x, y, uw, uh).populate(v).element;
          cnvs.appendChild(cnv);
          //Take a screenshot of this form, and remove the cnvs that were just added
          html2canvas(document.body, {
            onrendered: function (canvas) {
              screenshot.canvas = canvas;
              cnvs.innerHTML = "";
              cnvs.appendChild(canvas);
              canvas.style.position = "absolute";
              canvas.style.top = "0px";
              canvas.style.left = "0px";
              var pngUrl = canvas.toDataURL();
              Display.storage.set("x"+x+"y"+y+"v"+v, pngUrl);
              newCanvas(x - 1, y - 1, uw, uw, v);
            },
            width: bigX * bigUW,
            height: bigY * bigUH
          });
        } else {
          //Take a screenshot of the final form, and replace all of these divs with it
          //Now take a screenshot of size n x n

          html2canvas(document.body, {
            onrendered: function (canvas) {
              screenshot.canvas = canvas;
              //Remove all of the canvases from the body
              cnvs.innerHTML = "";
              //Add actual canvas to body
              document.body.appendChild(canvas);
              //Remove loading message from body
              loadingMessage.remove();
              //Set new canvas image as document.body background
              var pngUrl = canvas.toDataURL();
              document.body.style.background = "url(" + pngUrl + ") repeat";
              //Save image to storage
              Display.storage.set("x"+x+"y"+y+"v"+v, pngUrl);
              //Restore ui elements
              ui.style.display = "block";
            },
            width: bigX*bigUW,
            height: bigY*bigUH
          });
        }

      }, 1000/60);
    }
  }
  dim = 5;
  newCanvas(n, n, dim, dim, colourVariator);
});