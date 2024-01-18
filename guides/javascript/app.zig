const std = @import("std");
const Event = @import("event.zig").Event;
const m = @import("m.zig");

player_health: i32,
state: AppState,
cursor: m.Pos,
width: usize,
height: usize,

pub const App = @This();
const AppState = enum {
    display_static,
};
var rand = std.rand.DefaultPrng.init(0);
export fn random() i32 {
    return rand.random().int(i32);
}

pub fn init(self: *App, width: usize, height: usize) void {
    self.* = .{
        .player_health = 3,
        .state = .display_static,
        .width = width,
        .height = height,
        .cursor = .{ .x = 0, .y = 0 },
    };
}

pub fn quit(self: *App) void {
    _ = self;
}

pub fn update(self: *App) void {
    _ = self;
}

pub fn event(self: *App, e: Event) void {
    switch (e) {
        .mousemove => |mm| {
            self.cursor = mm;
        },
    }
}

const Box = struct {
    p1: m.Pos,
    p2: m.Pos,

    pub fn contains(self: Box, point: m.Pos) bool {
        return (point.x >= self.p1.x and point.x <= self.p2.x) and (point.y >= self.p1.y and point.y <= self.p2.y);
    }
};

pub fn draw(self: *App, canvas: *[]u8) void {
    switch (self.state) {
        .display_static => {
            clear(canvas);

            const mouse_box = Box{
                .p1 = .{
                    .x = @max(0, self.cursor.x - 10),
                    .y = @max(0, self.cursor.y - 10),
                },
                .p2 = .{
                    .x = @min(self.width - 1, self.cursor.x + 10),
                    .y = @min(self.height - 1, self.cursor.y + 10),
                },
            };

            {
                var pixel_index: usize = 0;
                while (pixel_index < canvas.len) : (pixel_index += 4) {
                    const index = pixel_index / 4;
                    const pos = m.Pos{
                        .x = index / self.width,
                        .y = @mod(index, self.width),
                    };
                    if (mouse_box.contains(pos)) {
                        canvas.*[pixel_index + 0] = rand.random().uintAtMost(u8, 60) + 60;
                        canvas.*[pixel_index + 1] = 10;
                        canvas.*[pixel_index + 2] = 30;
                        canvas.*[pixel_index + 3] = 255;
                    } else {
                        canvas.*[pixel_index + 0] = @as(u8, @intCast(@mod(pos.x, 255)));
                        canvas.*[pixel_index + 1] = rand.random().uintAtMost(u8, 60) + 60;
                        canvas.*[pixel_index + 2] = 30;
                        canvas.*[pixel_index + 3] = 255;
                    }
                }
            }

            {
                for (mouse_box.p1.x..mouse_box.p2.x) |x| {
                    for (mouse_box.p1.y..mouse_box.p2.y) |y| {
                        const pixel_index = x + y * self.width;
                        const arr_index = pixel_index * 4;

                        canvas.*[arr_index + 0] = rand.random().uintAtMost(u8, 60) + 60;
                        canvas.*[arr_index + 1] = 100;
                        canvas.*[arr_index + 2] = 255;
                        canvas.*[arr_index + 3] = 255;
                    }
                }
            }
        },
    }
}

fn clear(canvas: *[]u8) void {
    for (canvas.*) |*i| {
        i.* = 0;
    }
}
