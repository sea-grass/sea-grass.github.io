const std = @import("std");
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();

pub const entrypoint = "intro.wiki";

extern fn print(i32) void;

extern fn ask(pointer: [*]const u8, length: u32) [*:0]u8;

fn sendQuestion() void {
    const question: []const u8 = "What is your name?";
    const name_ptr = ask(question.ptr, question.len);
    _ = name_ptr;
}

export fn add(a: i32, b: i32) void {
    print(a + b);
}

export fn subtract(a: i32, b: i32) void {
    print(a - b);
}
