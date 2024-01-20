const m = @import("m.zig");

pub const EventType = enum {
    mousemove,
    wheel,
};

pub const Event = union(EventType) {
    mousemove: m.Pos,
    wheel: struct { dx: i32, dy: i32 },
};
