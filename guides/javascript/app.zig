const std = @import("std");

player_health: i32,
anim_index: usize,

pub const App = @This();
var rand = std.rand.DefaultPrng.init(0);
export fn random() i32 {
    return rand.random().int(i32);
}

pub fn init(self: *App) void {
    self.* = .{
        .player_health = 3,
        .anim_index = 0,
    };
}

pub fn quit(self: *App) void {
    _ = self;
}

pub fn update(self: *App) void {
    _ = self;
}

pub fn draw(self: *App, canvas: *[]u8) void {
    clear(canvas);

    var pixel_index: usize = 0;

    self.anim_index = 1 + (std.math.mod(usize, self.anim_index + 1, 128) catch 0);
    const skip = self.anim_index * 4;
    while (pixel_index < canvas.len) : (pixel_index += skip) {
        canvas.*[pixel_index + 0] = 10;
        canvas.*[pixel_index + 1] = 20;
        canvas.*[pixel_index + 2] = 30;
        canvas.*[pixel_index + 3] = 255;
    }
}

fn clear(canvas: *[]u8) void {
    for (canvas.*) |*i| {
        i.* = 0;
    }
}
