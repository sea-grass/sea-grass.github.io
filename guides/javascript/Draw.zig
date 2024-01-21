const std = @import("std");
const m = @import("m.zig");

const RectOptions = struct {
    from: m.Pos,
    to: m.Pos,
};

pub fn rect(canvas: *[]u8, width: usize, options: RectOptions) void {
    var it = RectIterator{
        .from = options.from,
        .to = options.to,
        .width = width,
    };

    while (it.next()) |arr_index| {
        canvas.*[arr_index + 0] = 200;
        canvas.*[arr_index + 1] = 200;
        canvas.*[arr_index + 2] = 200;
        canvas.*[arr_index + 3] = 255;
    }
}

pub const RectIterator = struct {
    state: enum { top, right, bottom, left, done } = .top,
    prev: ?m.Pos = null,

    from: m.Pos,
    to: m.Pos,
    width: usize,

    pub fn next(self: *RectIterator) ?usize {
        switch (self.state) {
            .done => {
                return null;
            },
            .top => {
                if (self.prev == null) {
                    self.prev = .{
                        .x = self.from.x,
                        .y = self.from.y,
                    };
                    return RectIterator.to1d(self.prev.?, self.width);
                } else {
                    const max_x = self.to.x;
                    const next_x = self.prev.?.x + 1;
                    if (next_x > max_x) {
                        self.prev = null;
                        self.state = .right;
                        return self.next();
                    } else {
                        self.prev.?.x = next_x;
                        return RectIterator.to1d(self.prev.?, self.width);
                    }
                }
            },
            .right => {
                if (self.prev == null) {
                    self.prev = .{
                        .x = self.to.x,
                        .y = self.from.y,
                    };
                    return RectIterator.to1d(self.prev.?, self.width);
                } else {
                    const max_y = self.to.y;
                    const next_y = self.prev.?.y + 1;
                    if (next_y > max_y) {
                        self.prev = null;
                        self.state = .bottom;
                        return self.next();
                    } else {
                        self.prev.?.y = next_y;
                        return RectIterator.to1d(self.prev.?, self.width);
                    }
                }
            },
            .bottom => {
                if (self.prev == null) {
                    self.prev = .{
                        .x = self.from.x,
                        .y = self.to.y,
                    };
                    return RectIterator.to1d(self.prev.?, self.width);
                } else {
                    const max_x = self.to.x;
                    const next_x = self.prev.?.x + 1;
                    if (next_x > max_x) {
                        self.prev = null;
                        self.state = .left;
                        return self.next();
                    } else {
                        self.prev.?.x = next_x;
                        return RectIterator.to1d(self.prev.?, self.width);
                    }
                }
            },
            .left => {
                if (self.prev == null) {
                    self.prev = .{
                        .x = self.from.x,
                        .y = self.from.y,
                    };
                    return RectIterator.to1d(self.prev.?, self.width);
                } else {
                    const max_y = self.to.y;
                    const next_y = self.prev.?.y + 1;
                    if (next_y > max_y) {
                        self.prev = null;
                        self.state = .done;
                        return self.next();
                    } else {
                        self.prev.?.y = next_y;
                        return RectIterator.to1d(self.prev.?, self.width);
                    }
                }
            },
        }

        return null;
    }

    fn to1d(p: m.Pos, width: usize) usize {
        const pixel_index = p.x + p.y * width;
        const arr_index = pixel_index * 4;
        return arr_index;
    }
};

test "RectIterator" {
    const from = m.Pos{ .x = 0, .y = 0 };
    const to = m.Pos{ .x = 2, .y = 2 };
    const width = 3;
    const expected_indices = [_]usize{
        // top line
        0,  4,  8,
        // right line
        20, 32,
        // bottom line
        24,
        28,
        // left line
        12,
    };

    const Ctx = struct {
        pub fn hash(self: @This(), k: usize) u64 {
            _ = self;
            return @intCast(k);
        }

        pub fn eql(self: @This(), a: usize, b: usize) bool {
            _ = self;
            return a == b;
        }
    };

    var seen = std.HashMap(usize, u32, Ctx, 99).init(std.testing.allocator);
    defer seen.deinit();
    for (&expected_indices) |i| {
        try seen.put(i, 0);
    }

    {
        var it = RectIterator{
            .from = from,
            .to = to,
            .width = width,
        };
        while (it.next()) |v| {
            const count = seen.get(v);

            if (count) |c| {
                try seen.put(v, c + 1);
            } else {
                std.debug.print("Received unexpected index: {d}\n", .{v});
                return error.UnexpectedIndex;
            }

            std.debug.print("\nnext:{d}\n", .{v});
        }
    }

    {
        var seen_it = seen.iterator();
        var failure = false;
        while (seen_it.next()) |entry| {
            if (entry.value_ptr.* != 1) {
                std.debug.print("Expected to see the index {d} exactly 1 time. Saw it {d} times.\n", .{
                    entry.key_ptr.*,
                    entry.value_ptr.*,
                });
                failure = true;
            }
            std.debug.print("{d} {d}\n", .{ entry.key_ptr.*, entry.value_ptr.* });
        }
        if (failure) {
            return error.UnexpectedNumberOfOccurrences;
        }
    }
}
