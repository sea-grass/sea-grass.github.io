(function() {
  'use strict';
  var container, n_input, v_input, image_input, start_button, start_image_button;

  n_input = new Cel({
    type: "input",
    id: "n",
    attrs: {
      name: "n",
      type: "text",
      value: 40
    }
  });
  v_input = new Cel({
    type: "input",
    id: "v",
    attrs: {
      name: "v",
      type: "text",
      value: 11
    }
  });
  image_input = new Cel({
    type: "input",
    id: "image",
    attrs: {
      name: "image",
      type: "file",
      value: null
    }
  });
  start_button = new Cel({
    type: "button",
    innerHTML: "Start",
    on: {
      click: startRender
    }
  });
  start_image_button = new Cel({
    type: "button",
    innerHTML: "Start image render",
    on: {
      click: startImageRender
    }
  });
  var container = new Cel({
    children: [
      {
        type: "label",
        innerHTML: "n",
        attrs: { for: "n" }
      },
      n_input,
      {
        type: "label",
        innerHTML: "v",
        attrs: { for: "v" }
      },
      v_input,
      {
        type: "label",
        innerHTML: "image",
        attrs: { for: "image" }
      },
      image_input,
      start_button,
      start_image_button
    ]
  });

  document.body.appendChild(container);

  function startRender() {
    var n,v;

    n = Number.parseInt(n_input.value);
    v = Number.parseInt(v_input.value);
    assert("N and V are integers", Number.isInteger(n), Number.isInteger(v));

    if (n > 300) {
      var doContinue = prompt("You entered an n greater than 300 (n="+n+"). This may take a long time. Proceed?");
      if (!doContinue) return;
    }

    //Hide the container
    container.style.display = "none";

    var canvas = new Cel({
      type: "canvas",
      attrs: {
        width: n,
        height: n,
        style: "border: 1px solid #ececec"
      }
    });
    var canvas_container = new Cel({
      classes: ['render'],
      children: [
        {
          innerHTML: "n="+n+" - v="+v
        },
        canvas
      ]
    });

    var ctx = canvas.getContext("2d");
    var id = ctx.createImageData(1, 1);
    document.body.appendChild(canvas_container);

    id.data[0] = 0; //r
    id.data[1] = 0; //g
    id.data[2] = 0; //b
    id.data[3] = 255; //a

    for (var x = 0; x < n; x++) {
      for (var y = 0; y < n; y++) {
        var r,g,b;

        r = id.data[0];
        g = id.data[1];
        b = id.data[2];

        b += v;
        if (b > 255) {
          b = b - 255;
          g += v;
          if (g > 255) {
            g = g - 255;
            r += v;
            if (r > 255) {
              r = r - 255;
            }
          }
        }

        id.data[0] = r;
        id.data[1] = g;
        id.data[2] = b;

        ctx.putImageData(id, x, y);
      }
    }

    console.log("TODO, do like, stuff");

    var img = new Cel({
      type:"img",
      
        attrs: {
          width:n*2, 
          height:n*2, 
          src:canvas.toDataURL()
        }
    });
    canvas.remove();
    canvas_container.appendChild(img);


    //Show the container again
    container.style.display = "";
  }

  function startImageRender() {
    var n,v,image_url,image;
    var image_canvas, image_ctx, image_id,data;

    n = Number.parseInt(n_input.value);
    v = Number.parseInt(v_input.value);

    assert("N and V are integers", Number.isInteger(n), Number.isInteger(v));
    assert("A file is selected", image_input.files.length > 0);
    image_url = URL.createObjectURL(image_input.files[0]);
    console.log(image_url);
    assert("Image url is not empty", image_url.length > 0);

    image = new Image;



   image.onload = drawImageToCanvas;
   image.src = image_url;

   function drawImageToCanvas(e) {
     image_canvas = new Cel({
      type: "canvas",
      attrs: {
        width: image.width,
        height: image.height
      }
     });
     image_ctx = image_canvas.getContext("2d");
     document.body.appendChild(image_canvas);

     image_ctx.drawImage(image, 0, 0);

     image_id = image_ctx.getImageData(0, 0, image.width,image.height);
     data = image_id.data;
     for (var i = 0; i < data.length; i++) {
      var _r = i + 0,
          _g = i + 1,
          _b = i + 2,
          _a = i + 3;
      var r = data[_r],
          g = data[_g],
          b = data[b];
      r++;
      g++;
      b++;
      data[_r] = r;
      data[_g] = g;
      data[_b] = b;
     }
     /*
     for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
          data[y*image_canvas.width + x + 0] = 0;
          data[y*image_canvas.width + x + 1] = 0;
          data[y*image_canvas.width + x + 2] = 0;
          data[y*image_canvas.width + x + 3] = 0;
        }
     }
     */
     image_ctx.putImageData(image_id, 0, 0);
   }

  }

  function assert() {
    if (arguments.length < 2) throw "Assert didn't receive enough args.";

    var message = arguments[0];
    var failed = false;
    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i]) {
        failed = true;
        break;
      }
    }
    if (failed) {
      throw "Assert failed: " + message;
    }
  }
}())
