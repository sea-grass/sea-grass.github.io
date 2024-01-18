const debug = {
  afterLoad(wasm_instantiate_result) {
    console.table(wasm_instantiate_result.instance.exports);
    window.wasm_instantiate_result= wasm_instantiate_result;
  },
};

class DoubleBuffer {
  constructor(canvas, mem, mem_offset, width, height) {
    this.ctx = canvas.getContext("2d");
    this.image_data = this.ctx.createImageData(width, height);
    this.mem = mem;
    this.mem_offset = mem_offset;
    this.mem_len = width * height * 4;
    this.width = width;
    this.height = height;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.putImageData(this.image_data, 0, 0);
  }

  swap() {
    const mem = this.mem.slice(this.mem_offset, this.mem_offset + this.mem_len);
    this.image_data.data.set(mem);
  }
}

(async function(){
  const memory = new WebAssembly.Memory({
    initial: 2,
    maximum: 15,
  });

  const import_object = { env: { memory }};

  const obj = await WebAssembly.instantiateStreaming(fetch("app.wasm"), import_object);
  debug.afterLoad(obj);

  const canvas = document.querySelector('canvas');
  canvas.width = obj.instance.exports.getWidth();
  canvas.height= obj.instance.exports.getHeight();

  const ledger = {
    double_buf: undefined,
    wasm_memory_array: undefined,
  };

  function displayFatalError(err) {
    document.querySelector("#error").innerText = err.message + "\n" + err.stack;
  }

  const app = {
    init() {
      obj.instance.exports.init();
      console.log(obj.instance.exports.getCanvasPtr());
      ledger.wasm_memory_array = new Uint8Array(memory.buffer);
      ledger.double_buf = new DoubleBuffer(
        canvas,
        ledger.wasm_memory_array,
        obj.instance.exports.getCanvasPtr(),
        canvas.width,
        canvas.height,
      );
      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();

        const actual_width = rect.width;
        const width_scale = actual_width / canvas.width;
        const x = e.clientX - rect.left;
        const pixel_x = Math.floor(x / width_scale);

        const actual_height = rect.height;
        const height_scale = actual_height / canvas.height;
        const y = e.clientY - rect.top;
        const pixel_y = Math.floor(y / height_scale);

        obj.instance.exports.mousemove(pixel_x, pixel_y);

      });
    },
    quit() { obj.instance.exports.quit(); },
    shouldLoop() { return true; },
    update() { obj.instance.exports.update(); },
    draw() {
      obj.instance.exports.draw();
      ledger.double_buf.swap();
      ledger.double_buf.draw();
    },
    start() {
      try {
        app.init();
      } catch (err) {
        displayFatalError(err);
        return;
      }
      app.loop();

    },
    loop() {
      app.update();
      app.draw();

      if (app.shouldLoop()) {
        const promise = new Promise((res) => setTimeout(res, 1000/60));
        requestAnimationFrame(() => promise.then(app.loop));
      } else {
        app.quit();
      }
    }
  };

  app.start();

})();
