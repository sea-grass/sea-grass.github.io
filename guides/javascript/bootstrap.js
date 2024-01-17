const debug = {
  afterLoad(wasm_instantiate_result) {
    console.table(wasm_instantiate_result.instance.exports);
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
    this.image_data.data.set(
      this.mem.slice(this.mem_offset, this.mem_offset + this.mem_len)
    );
  }
}
(async function(){
  const memory = new WebAssembly.Memory({
    initial: 2,
    maximum: 2,
  });

  const callback_ptrs = new Set;
  const mouseover_callback_ptrs = new Set;

  const import_object = {
    env: {
      print(num) {
        console.log("env.print", num);
      },
      registerClickCallback(callback_ptr) {
        console.log("registerClickCallback", callback_ptr);
        callback_ptrs.add(callback_ptr);
      },
      registerMouseoverCallback(callback_ptr) {
        console.log("registerMouseoverback", callback_ptr);
        mouseover_callback_ptrs.add(callback_ptr);
      },
      memory,
    },
  };

  const obj = await WebAssembly.instantiateStreaming(fetch("app.wasm"), import_object);
  debug.afterLoad(obj);
  const wasm_memory_array = new Uint8Array(memory.buffer);

  const checkerboard_size = obj.instance.exports.getCheckerboardSize();
  const canvas = document.querySelector("canvas");
  canvas.width = checkerboard_size;
  canvas.height = checkerboard_size;

  canvas.addEventListener("mouseover", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (const callback_ptr of mouseover_callback_ptrs) {
      console.log(callback_ptr);
      obj.instance.exports.onMouseoverCallback(callback_ptr, x, y);
    }
  });
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (const callback_ptr of callback_ptrs) {
      obj.instance.exports.onClickCallback(callback_ptr, x, y);
    }
  });

  const double_buf = new DoubleBuffer(
    canvas, wasm_memory_array, obj.instance.exports.getCheckerboardBufferPointer(), canvas.width, canvas.height,
  );

  obj.instance.exports.init();
  loop();

  function loop() {
    obj.instance.exports.update();

    obj.instance.exports.draw();
    // handle drawing
    double_buf.swap();
    double_buf.draw();

    const promise = new Promise((res) => setTimeout(res, 1000/60));
    requestAnimationFrame(() => promise.then(loop));
  };
})();
