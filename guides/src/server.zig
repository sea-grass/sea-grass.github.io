const std = @import("std");
const worker = @import("worker");

fn handle(resp: *worker.Response, req: *worker.Request) void {
    _ = req;

    _ = &resp.headers.append("x-generated-by", "wasm-workers-server");
    _ = &resp.writeAll("hello from zig");
}

pub fn main() void {
    worker.ServeFunc(handle);
}
