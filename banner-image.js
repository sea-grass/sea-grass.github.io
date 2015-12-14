/* jshint validthis: true */
var BannerImage;

(function() {
  "use strict";
  
  var BannerImagePrototype = Object.create(HTMLDivElement.prototype);
  var Style = {};
  
  Style.Base = {
    ":host": {
      "position": "relative",
      "top": "0",
      "left": "0",
      "width": "100%",
      "height": "100%",
      "background-color": "#999"
    },
    ":host .banner-image": {
      "background-size": "100%",
      "position": "relative",
      "background-repeat": "no-repeat",
      "background-position": "50%",
      "height": "60px",
      "width": "100%",
      "margin-bottom": "10px",
      "background-color": "#333",
      "opacity": "0"
    },
    ":host .banner-image::after": {
      "content": "''",
      "width": "100%",
      "height": "10px",
      "position": "absolute",
      "bottom": "-10px",
      "left": "0",
      "background-color": "#eee",
      "box-sizing": "border-box",
      "border-left": "Calc(0.005 * 100vw) solid rgba(0, 0, 0, 0)",
      "border-right": "Calc(0.005 * 100vw) solid rgba(0,0,0,0)",
      "border-top": "10px solid #999"
    }
  };
  /* Style.Sheet(styleName1, styleName2, ...) -- generates css text based on stylenames supplied */
  Style.Sheet = function() {
    //TODO: Add hash map
    var sheet, // the css text string
        i, b;  // i is iterator variable, b is the object containing the base css rules
    sheet = "";
    b = this["Base"];

    /* always add base rules */
    for (var s in b) { sheet+=s+"{";for(var k in b[s]){var v = b[s][k];sheet+=k+":"+v+";";}sheet+="}";}
    
    /* add specified rules, if they exist */
    for (i = 0; i < arguments.length; i++) {
      /* var styleName = arguments[i]; */
      var rules = this[arguments[i]];
      if (!rules) continue;
      
      for (var selector in rules) {
        sheet += selector + "{";
        for (var key in rules[selector]) {
          var value = rules[selector][key];
          sheet += key + ":" + value + ";";
        }
        sheet += "}";
      }
    }

    return sheet;
  };
  Object.defineProperty(BannerImagePrototype, "src", {
    get:function(){
      return this.getAttribute("src");
    },
    set: function(val) {
      this.setAttribute("src", val);
    }
  });
  (function() {
    var style = null, image = null, _initialized = false;
    Object.defineProperty(BannerImagePrototype, "image", {
      get: function() {
        if (image === null) {
          image = document.createElement("div");
          image.classList.add("banner-image");
        }
        return image;
      },
      set: function(val) {
        throw "cannot modify image property of banner-image";
      }
    });
    Object.defineProperty(BannerImagePrototype, "shadowStyle", {
      get: function() {
        if (style === null) {
          style = document.createElement("style");
        }
        return style;
      },
      set: function(val) {
        throw "cannot modify shadowStyle property of banner-image";
      }
    });
    Object.defineProperty(BannerImagePrototype, "initialized", {
      get: function() {
        switch(_initialized) {
          case true:
            return true;
          case "pending":
            return true;
          case false:
            return false;
        }
        return false;
      },
      set: function(val) {
        switch (val) {
          case true:
          case "pending":
          case false:
            _initialized = val;
            break;
          default:
            throw "Error! Illegal value assigned to _initialized";
        }
      }
    });
  })();
  
  BannerImagePrototype.appendChild = function() {
    if (!this.initialized) this.initialize();
    if (arguments.length != 1) throw "Invalid use of appendChild";
    
    return this.shadowRoot.appendChild(arguments[0]);
  };
  
  BannerImagePrototype.initialize = function() {
    this.initialized = "pending";

    this.createShadowRoot();

    this.appendChild(this.shadowStyle);
    this.appendChild(this.image);
    
    this.id = Math.floor(Math.random() * 10000) % 3000;
    this.initialized = true;
  };
  
  
  
  /* define callbacks */
  function onCreated() {
    if (!this.initialized) this.initialize();
  }
  function onAttached() {
    if (!this.initialized) this.initialize();
    var self = this;
    
    self.shadowStyle.innerText = Style.Sheet();
    
    if (!self.src) throw "banner-image missing src";
    
    /* using _image to load the src before we set it as the background image */
    var _image = document.createElement("img");
    _image.src = self.src;
    /* once _image has loaded, we set it as the background and animate it */
    _image.addEventListener("load", function(e){
      var opacity = 0;
      self.image.style.backgroundImage = "url(" + self.src + ")";
      self.image.style.opacity = opacity;
      requestAnimationFrame(loadImage);
      
      function loadImage() {
        /* keep increasing opacity until it is fully opaque */
        if (self.image.style.opacity < 1) {
          opacity += 0.1;
          self.image.style.opacity = opacity;
          window.setTimeout(function() {
            requestAnimationFrame(loadImage);
          }, 1000/30);
        }
      }
    });
  }
  function onDetached() {
    
  }
  function onAttributeChanged(attrName, oldValue, value) {}
  
  BannerImagePrototype.createdCallback = onCreated;
  BannerImagePrototype.attachedCallback = onAttached;
  BannerImagePrototype.detachedCallback = onDetached;
  BannerImagePrototype.attributeChangedCallback = onAttributeChanged;
  /* TODO: Consider document.registerElement polyfill at:
  https://github.com/WebReflection/document-register-element */
  document.registerElement("banner-image", {
    "prototype": BannerImagePrototype
  });
})();