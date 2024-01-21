const std = @import("std");
const worker = @import("worker");

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();

fn handle(resp: *worker.Response, req: *worker.Request) void {
    var cache = req.context.cache;
    var counter: i32 = 0;

    const v = cache.getOrPut("counter") catch undefined;

    if (!v.found_existing) {
        v.value_ptr.* = "0";
    } else {
        const counter_value = v.value_ptr.*;
        const num = std.fmt.parseInt(i32, counter_value, 10) catch undefined;
        counter = num + 1;
        const num_s = std.fmt.allocPrint(allocator, "{d}", .{counter}) catch undefined;
        _ = cache.put("counter", num_s) catch undefined;
        std.log.info("hi", .{});
    }

    const body = std.fmt.allocPrint(allocator, "The number is {d}", .{counter}) catch undefined;
    defer allocator.free(body);

    _ = &resp.headers.append("x-generated-by", "wasm-workers-server");
    _ = &resp.writeAll(body);
}

pub fn main() void {
    worker.ServeFunc(handle);
}
