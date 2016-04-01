(function() {
  'use strict';
  var container, n_input, v_input, start_button;

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
  start_button = new Cel({
    type: "button",
    innerHTML: "Start",
    on: {
      click: startRender
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
      start_button
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
