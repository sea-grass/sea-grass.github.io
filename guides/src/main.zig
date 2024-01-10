const std = @import("std");
const foo = @import("foo.zig");

pub fn main() !void {
    const log = std.log.scoped(.main);

    log.info("foo entrypoint {s}", .{foo.entrypoint});
}
