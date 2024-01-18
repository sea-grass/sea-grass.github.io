const std = @import("std");
const Event = @import("event.zig").Event;
const m = @import("m.zig");

player_health: i32,
state: AppState,
cursor: m.Pos,
width: usize,
height: usize,
allocator: std.mem.Allocator,
mobs: std.ArrayList(Mob),

pub const App = @This();
const AppState = enum {
    display_static,
    display_mobs,
};
const Mob = struct {
    pos: m.Pos,
    state: enum { down, right, up, left, random, avoid_cursor } = .down,
    hp: u32 = 3,

    pub fn update(self: *Mob, app: *const App) void {
        if (self.hp == 0) return;

        const width = app.width;
        const height = app.height;
        switch (self.state) {
            .down => {
                if (self.pos.y < height / 2) self.pos.y += 1;
                if (self.pos.y >= height / 2) {
                    self.state = .right;
                    self.pos.y -= 1;
                }
            },
            .right => {
                if (self.pos.x < width / 2) self.pos.x += 1;
                if (self.pos.x >= width / 2) {
                    self.state = .up;
                    self.pos.x -= 1;
                }
            },
            .up => {
                if (self.pos.y > height / 8) self.pos.y -= 1;
                if (self.pos.y == height / 8) {
                    self.state = .left;
                    self.pos.y += 1;
                }
            },
            .left => {
                if (self.pos.x > width / 8) self.pos.x -= 1;
                if (self.pos.x == width / 8) {
                    self.state = .down;
                    self.pos.x += 1;
                }
            },
            .random => {
                if (self.pos.x == 0) {
                    self.pos.x += 1;
                } else if (self.pos.x >= width) {
                    self.pos.x = width - 1;
                }

                if (self.pos.y == 0) {
                    self.pos.y += 1;
                } else if (self.pos.y >= height) {
                    self.pos.y = height - 1;
                }

                const dx = rand.random().uintLessThan(u32, 3);
                if (rand.random().boolean()) {
                    self.pos.x = @min(width, self.pos.x + dx);
                } else {
                    self.pos.x = @max(0, self.pos.x - dx);
                }

                const dy = rand.random().uintLessThan(u32, 3);
                if (rand.random().boolean()) {
                    self.pos.y = @min(height, self.pos.y + dy);
                } else {
                    self.pos.y = @max(0, self.pos.y - dy);
                }
            },
            .avoid_cursor => {
                const mouse_r = 2;
                const mouse_box = Box{
                    .p1 = .{
                        .x = @max(0, app.cursor.x - mouse_r),
                        .y = @max(0, app.cursor.y - mouse_r),
                    },
                    .p2 = .{
                        .x = @min(app.width - 1, app.cursor.x + mouse_r),
                        .y = @min(app.height - 1, app.cursor.y + mouse_r),
                    },
                };

                if (mouse_box.contains(self.pos)) {
                    self.hp = @max(0, self.hp - 1);
                    const dx = rand.random().uintLessThan(u32, 3);
                    if (rand.random().boolean()) {
                        self.pos.x = @min(width, self.pos.x + dx);
                    } else {
                        self.pos.x = @max(0, self.pos.x - dx);
                    }

                    const dy = rand.random().uintLessThan(u32, 3);
                    if (rand.random().boolean()) {
                        self.pos.y = @min(height, self.pos.y + dy);
                    } else {
                        self.pos.y = @max(0, self.pos.y - dy);
                    }
                }
            },
        }
    }

    pub fn draw(self: Mob, app: *const App, canvas: *[]u8) void {
        if (self.hp == 0) return;

        const width = app.width;

        const index = pos1d(self.pos, width) * 4;
        canvas.*[index + 0] = 0;
        canvas.*[index + 1] = 0;
        canvas.*[index + 2] = 255;
        canvas.*[index + 3] = 255;
    }
};

fn pos2d(pos: u32, width: u32) m.Pos {
    return m.Pos{
        .x = pos / width,
        .y = @mod(pos, width),
    };
}

fn pos1d(pos: m.Pos, width: u32) u32 {
    return pos.x + pos.y * width;
}

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
    };

    if (false) {
        for (0..10) |_| {
            self.mobs.append(Mob{ .pos = .{ .x = rand.random().uintAtMost(u32, 32), .y = rand.random().uintAtMost(u32, 32) }, .state = .avoid_cursor }) catch {};
        }
    }
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
        mob.update(self);
    }
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
        .display_mobs => {
            {
                clear(canvas);

                const mouse_r = 2;
                const mouse_box = Box{
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
