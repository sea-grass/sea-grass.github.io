(function() {
  'use strict';
  var container, n_input, v_input, start_button;

  n_input = new Cel({
    type: "input",
    id: "n",
    attrs: {
      name: "n",
      type: "text"
    }
  });
  v_input = new Cel({
    type: "input",
    id: "v",
    attrs: {
      name: "v",
      type: "text"
    }
  });
  start_button = new Cel({
    type: "button",
    on: {
      click: startRender
    }
  });
  var container = new Cel({
    children: [
      new Cel({
        type: "label",
        innerHTML: "n",
        attrs: { for: "n" }
      }),
      n_input,
      new Cel({
        type: "label",
        innerHTML: "v",
        attrs: { for: "v" }
      }),
      v_input,
      start_button
    ]
  });

  function startRender() {
    container.style.display = "none";

    console.log("TODO, do like, stuff");

    window.setTimeout(function() {
      container.style.display = "";
    }, 3000);
  }
}())
