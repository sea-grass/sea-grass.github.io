const m = @import("m.zig");

pub const EventType = enum {
    mousemove,
};

pub const Event = union(EventType) {
    mousemove: m.Pos,
};
