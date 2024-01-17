const std = @import("std");
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();
const Js = @import("js.zig");

pub const entrypoint = "intro.wiki";
const maximum_player_health = 3;
var player_health: i32 = maximum_player_health;

const ClickEvent = struct {
    x: i32,
    y: i32,
};
const ClickCallbackFn = fn (clickEvent: ClickEvent) void;
export fn onClickCallback(callbackFnPtr: u32, x: i32, y: i32) void {
    const callbackFn: *ClickCallbackFn = @ptrFromInt(callbackFnPtr);
    callbackFn(.{ .x = x, .y = y });
}

const MouseoverEvent = struct {
    x: i32,
    y: i32,
};
const MouseoverCallbackFn = fn (MouseoverEvent) void;
export fn onMouseoverCallback(callbackFnPtr: u32, x: i32, y: i32) void {
    const callbackFn: *MouseoverCallbackFn = @ptrFromInt(callbackFnPtr);
    callbackFn(.{ .x = x, .y = y });
}

export fn init() void {
    Js.registerClickCallback(@intFromPtr(&onClick));
    Js.registerMouseoverCallback(@intFromPtr(&onMouseover));
}

export fn update() void {}
export fn draw() void {
    colourCheckerboard();
}

fn onClick(clickEvent: ClickEvent) void {
    Js.print(clickEvent.x + clickEvent.y);
}

fn onMouseover(mouseoverEvent: MouseoverEvent) void {
    Js.print(mouseoverEvent.x + mouseoverEvent.y);
}

const Foo = enum(i32) { a, b, c };
export fn useFoo(foo: Foo) void {
    _ = foo;
}

var rand = std.rand.DefaultPrng.init(0);
export fn random() i32 {
    return rand.random().int(i32);
}

const checkerboard_size: usize = 8;

var checkerboard_buffer = std.mem.zeroes(
    [checkerboard_size][checkerboard_size][4]u8,
);

export fn getCheckerboardBufferPointer() [*]u8 {
    return @ptrCast(&checkerboard_buffer);
}

export fn getCheckerboardSize() i32 {
    return checkerboard_size;
}

export fn colourCheckerboard() void {
    for (&checkerboard_buffer, 0..) |*row, y| {
        for (row, 0..) |*square, x| {
            square.*[0] = @as(u8, @intCast(x * checkerboard_size));
            square.*[1] = @as(u8, @intCast(y * checkerboard_size));
            square.*[2] = @as(u8, @intCast((if (x > y) x - y else y - x) * checkerboard_size));
            square.*[3] = rand.random().uintAtMost(u8, 128 - @as(u8, @intCast(y)) * (127 / @as(u8, checkerboard_size)));
        }
    }
}
