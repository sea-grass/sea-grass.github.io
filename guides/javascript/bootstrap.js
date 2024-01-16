(async function(){
  const memory = new WebAssembly.Memory({
    initial: 2,
    maximum: 2,
  });

  const callback_ptrs = new Set;

  const import_object = {
    env: {
      print(num) {
        console.log("env.print", num);
      },
      registerClickCallback(callback_ptr) {
        console.log("registerClickCallback", callback_ptr);
        callback_ptrs.add(callback_ptr);
      },
      memory,
    },
  };

  const obj = await WebAssembly.instantiateStreaming(fetch("app.wasm"), import_object);
  const wasm_memory_array = new Uint8Array(memory.buffer);

  const memory_ui = document.querySelector("pre#memory");

  const checkerboard_size = obj.instance.exports.getCheckerboardSize();
  const canvas = document.querySelector("canvas");
  canvas.width = checkerboard_size;
  canvas.height = checkerboard_size;

  canvas.addEventListener("click", (e) => {
    console.log(e);
    console.log(callback_ptrs);
    const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
    for (const callback_ptr of callback_ptrs) {
      console.log(callback_ptr);
      obj.instance.exports.onClickCallback(callback_ptr, x, y);
    }
  });

  const ctx = canvas.getContext("2d");
  const image_data = ctx.createImageData(canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const getDarkValue = () => {
    return Math.floor(Math.random() * 100);
  };
  const getLightValue = () => {
    return Math.floor(Math.random() * 127) + 127;
  };

  const drawCheckerboard = () => {
    obj.instance.exports.colourCheckerboard(
      getDarkValue(),
      getDarkValue(),
      getDarkValue(),
      getLightValue(),
      getLightValue(),
      getLightValue(),
    );

    const buffer_offset = obj.instance.exports.getCheckerboardBufferPointer();
    const image_data_array = wasm_memory_array.slice(
      buffer_offset,
      buffer_offset + checkerboard_size * checkerboard_size * 4,
    );

    image_data.data.set(image_data_array);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(image_data, 0, 0);
  };

  const drawMemory = () => {
    const buffer_offset = obj.instance.exports.getCheckerboardBufferPointer();
    const image_data_array = wasm_memory_array.slice(
      buffer_offset,
      buffer_offset + checkerboard_size * checkerboard_size * 4,
    );
    memory_ui.innerText = image_data_array.join("\n");
  };

  obj.instance.exports.init();
  drawCheckerboard();
  console.log(memory.buffer);
    const buffer_offset = obj.instance.exports.getCheckerboardBufferPointer();
    const image_data_array = wasm_memory_array.slice(
      buffer_offset,
      buffer_offset + checkerboard_size * checkerboard_size * 4,
    );
  console.log(image_data_array);
  
  const loop = () => {
    const foo = 0;
    obj.instance.exports.useFoo(foo);
    drawCheckerboard();
    drawMemory();
    const promise = new Promise((res) => setTimeout(res, 1000/1));
    requestAnimationFrame(() => promise.then(loop));
  };
  loop();
})();
