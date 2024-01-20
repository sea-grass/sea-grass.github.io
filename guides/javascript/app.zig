const std = @import("std");
const Event = @import("event.zig").Event;
const m = @import("m.zig");
const Mob = @import("Mob.zig");
const Draw = @import("Draw.zig");

player_health: i32,
state: AppState,
cursor: m.Pos,
cursor_r: usize,
width: usize,
height: usize,
allocator: std.mem.Allocator,
mobs: std.ArrayList(Mob),
total_mobs: u32,
mobs_left: u32,

pub const App = @This();
const AppState = enum {
    display_static,
    display_mobs,
    display2,
};

var rand = std.rand.DefaultPrng.init(0);
export fn random() i32 {
    return rand.random().int(i32);
}

pub fn init(self: *App, allocator: std.mem.Allocator, width: usize, height: usize) void {
    self.* = .{
        .player_health = 3,
        .state = .display2,
        .width = width,
        .height = height,
        .cursor = .{ .x = 0, .y = 0 },
        .cursor_r = 2,
        .allocator = allocator,
        .mobs = std.ArrayList(Mob).init(allocator),
        .total_mobs = self.width * self.height,
        .mobs_left = self.width * self.height,
    };

    for (0..self.width) |x| {
        for (0..self.height) |y| {
            self.mobs.append(Mob{
                .pos = .{
                    .x = x,
                    .y = y,
                },
                .state = .avoid_cursor,
            }) catch {};
        }
    }
}

pub fn quit(self: *App) void {
    self.mobs.deinit();
}

pub fn update(self: *App, time: u32, dt: u32) void {
    for (self.mobs.items) |*mob| {
        if (mob.hp > 0) {
            mob.update(self, time, dt);
            if (mob.hp == 0) {
                self.mobs_left -= 1;
            }
        }
    }
}

pub fn event(self: *App, e: Event) void {
    switch (e) {
        .mousemove => |mm| {
            self.cursor = mm;
        },
        .wheel => |wheel| {
            const min = 2;
            const max = self.width / 4;
            const dy = 2;
            if (wheel.dy < 0) {
                self.cursor_r = @max(min, self.cursor_r - dy);
            } else if (wheel.dy > 0) {
                self.cursor_r = @min(max, self.cursor_r + dy);
            }
        },
    }
}

pub fn draw(self: *App, time: u32, dt: u32, canvas: *[]u8) void {
    _ = dt;
    switch (self.state) {
        .display_static => {
            clear(canvas);

            const mouse_box = m.Box{
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
        .display_mobs => {
            {
                clear(canvas);

                self.drawCursor(canvas);
            }
            for (self.mobs.items) |mob| {
                mob.draw(self, canvas);
            }
        },
        .display2 => {
            clear(canvas);
            for (0..self.width) |x_index| {
                const x: u8 = @intCast(x_index);
                for (0..self.height) |y_index| {
                    const y: u8 = @intCast(y_index);

                    const pixel_index = x + y * self.width;
                    const arr_index = pixel_index * 4;

                    const v: [4]u8 = @bitCast(time + x + y);

                    canvas.*[arr_index + 0] = @mod(v[0], 128);
                    canvas.*[arr_index + 1] = @mod(v[1], 255);
                    canvas.*[arr_index + 2] = @mod(v[2], 255);
                    canvas.*[arr_index + 3] = 255;
                }
            }
            for (self.mobs.items) |mob| {
                mob.draw(self, canvas);
            }

            Draw.rect(canvas, self.width, .{
                .from = .{ .x = 1, .y = 1 },
                .to = .{ .x = 50, .y = 50 },
            });

            self.drawCursor(canvas);
        },
    }
}

fn clear(canvas: *[]u8) void {
    for (canvas.*) |*i| {
        i.* = 0;
    }
}

fn drawCursor(self: *const App, canvas: *[]u8) void {
    const mouse_r = self.cursor_r;
    var it = Draw.RectIterator{
        .from = .{
            .x = @max(0, self.cursor.x - mouse_r),
            .y = @max(0, self.cursor.y - mouse_r),
        },
        .to = .{
            .x = @min(self.width - 1, self.cursor.x + mouse_r),
            .y = @min(self.height - 1, self.cursor.y + mouse_r),
        },
        .width = self.width,
    };

    while (it.next()) |arr_index| {
        canvas.*[arr_index + 0] = rand.random().uintAtMost(u8, 60) + 60;
        canvas.*[arr_index + 1] = 255;
        canvas.*[arr_index + 2] = 100;
        canvas.*[arr_index + 3] = 255;
    }
}
