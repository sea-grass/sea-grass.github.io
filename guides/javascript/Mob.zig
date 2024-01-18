const std = @import("std");
const m = @import("m.zig");
const App = @import("app.zig");
const Mob = @This();
var rand = std.rand.DefaultPrng.init(0);

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
            const mouse_box = m.Box{
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

    const index = m.pos1d(self.pos, width) * 4;
    const a = rand.random().uintAtMost(u8, 50) + 200;
    if (self.hp == 1) {
        canvas.*[index + 0] = 100;
        canvas.*[index + 1] = 100;
        canvas.*[index + 2] = 200;
        canvas.*[index + 3] = a;
    } else if (self.hp == 2) {
        canvas.*[index + 0] = 50;
        canvas.*[index + 1] = 50;
        canvas.*[index + 2] = 230;
        canvas.*[index + 3] = a;
    } else {
        canvas.*[index + 0] = 0;
        canvas.*[index + 1] = 0;
        canvas.*[index + 2] = 230 + rand.random().uintAtMost(u8, 20);
        canvas.*[index + 3] = a;
    }
}
