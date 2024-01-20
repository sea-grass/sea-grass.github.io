const std = @import("std");
const App = @import("app.zig");
const allocator = std.heap.wasm_allocator;
const JS = @import("js.zig");

const height = 256;
const width = 256;

var app: *App = undefined;
var canvas_buf_ptr: []u8 = undefined;
var time: u32 = undefined;

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
    app.init(allocator, width, height);
    time = JS.getTime();
}

export fn quit() void {
    app.quit();
    allocator.destroy(app);
    allocator.free(canvas_buf_ptr);
}

export fn update() void {
    const new_time = JS.getTime();
    const dt = new_time - time;
    app.update(new_time, dt);
}

export fn draw() void {
    // this should happen in one place, but not in either update or draw
    const new_time = JS.getTime();
    const dt = new_time - time;
    time = new_time;
    app.draw(new_time, dt, &canvas_buf_ptr);
}

export fn mousemove(x: u32, y: u32) void {
    app.event(.{ .mousemove = .{ .x = x, .y = y } });
}

export fn wheel(dx: i32, dy: i32) void {
    app.event(.{ .wheel = .{ .dx = dx, .dy = dy } });
}

export fn getRemaining() u32 {
    return app.mobs_left;
}

export fn getTotal() u32 {
    return app.total_mobs;
}
