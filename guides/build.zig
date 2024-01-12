const std = @import("std");
const BuildGuide = @import("src/BuildGuide.zig");

pub fn build(b: *std.Build) void {
    {
        const build_guide = BuildGuide.create(b, .{
            .entrypoint = "./javascript/intro.wiki",
            .prefix_install_path = "js-guide",
        });

        const run_build = b.step("js-guide", "Build the JS guide");
        run_build.dependOn(&build_guide.step);
    }
}
