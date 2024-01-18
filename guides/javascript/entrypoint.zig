const std = @import("std");
const App = @import("app.zig");
const allocator = std.heap.wasm_allocator;

const height = 256;
const width = 256;

var app: *App = undefined;

var canvas_buf_ptr: []u8 = undefined;

export fn getCanvasPtr() [*]u8 {
    return @ptrCast(canvas_buf_ptr);
}

export fn getWidth() u32 {
    return width;
}

export fn getHeight() u32 {
    return height;
}

export fn init() void {
    canvas_buf_ptr = allocator.alloc(u8, height * width * 4) catch @panic("Failed to allocate memory to store the canvas pixels.");
    app = allocator.create(App) catch @panic("Failed to allocate memory for the App");
    app.init(width, height);
}

export fn quit() void {
    app.quit();
    allocator.destroy(app);
    allocator.free(canvas_buf_ptr);
}

export fn update() void {
    app.update();
}

export fn draw() void {
    app.draw(&canvas_buf_ptr);
}

export fn mousemove(x: u32, y: u32) void {
    app.event(.{ .mousemove = .{ .x = x, .y = y } });
}
