const std = @import("std");
const Event = @import("event.zig").Event;
const m = @import("m.zig");
const Mob = @import("Mob.zig");

player_health: i32,
state: AppState,
cursor: m.Pos,
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
};

var rand = std.rand.DefaultPrng.init(0);
export fn random() i32 {
    return rand.random().int(i32);
}

pub fn init(self: *App, allocator: std.mem.Allocator, width: usize, height: usize) void {
    self.* = .{
        .player_health = 3,
        .state = .display_mobs,
        .width = width,
        .height = height,
        .cursor = .{ .x = 0, .y = 0 },
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

pub fn update(self: *App) void {
    for (self.mobs.items) |*mob| {
        if (mob.hp > 0) {
            mob.update(self);
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
    }
}

pub fn draw(self: *App, canvas: *[]u8) void {
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

                const mouse_r = 2;
                const mouse_box = m.Box{
                    .p1 = .{
                        .x = @max(0, self.cursor.x - mouse_r),
                        .y = @max(0, self.cursor.y - mouse_r),
                    },
                    .p2 = .{
                        .x = @min(self.width - 1, self.cursor.x + mouse_r),
                        .y = @min(self.height - 1, self.cursor.y + mouse_r),
                    },
                };
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
            for (self.mobs.items) |mob| {
                mob.draw(self, canvas);
            }
        },
    }
}

fn clear(canvas: *[]u8) void {
    for (canvas.*) |*i| {
        i.* = 0;
    }
}
