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

export fn init() void {
    Js.registerClickCallback(@intFromPtr(&onClick));
}

fn onClick(clickEvent: ClickEvent) void {
    Js.print(clickEvent.x + clickEvent.y);
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

export fn colourCheckerboard(
    dark_value_red: u8,
    dark_value_green: u8,
    dark_value_blue: u8,
    light_value_red: u8,
    light_value_green: u8,
    light_value_blue: u8,
) void {
    for (&checkerboard_buffer, 0..) |*row, y| {
        for (row, 0..) |*square, x| {
            var is_dark_square = true;

            if ((y % 2) == 0) {
                is_dark_square = false;
            }

            if ((x % 2) == 0) {
                is_dark_square = !is_dark_square;
            }

            var square_value_red = dark_value_red;
            var square_value_green = dark_value_green;
            var square_value_blue = dark_value_blue;
            if (!is_dark_square) {
                square_value_red = light_value_red;
                square_value_green = light_value_green;
                square_value_blue = light_value_blue;
            }

            square.*[0] = square_value_red;
            square.*[1] = square_value_green;
            square.*[2] = square_value_blue;
            square.*[3] = 255;
        }
    }
}
