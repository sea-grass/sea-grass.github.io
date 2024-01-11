const std = @import("std");

const Guide = struct {
    entrypoint: []const u8,
};

const GuideStep = struct {
    meta: Guide,
    build_step: *std.Build.Step.Run,
    write_step: *std.Build.Step.WriteFile,
};

pub fn build(b: *std.Build) void {
    const build_js_guide = step: {
        const js_guide = Guide{
            .entrypoint = "./javascript/intro.wiki",
        };
        const step = b.step("js-guide", "Build the JS guide");

        var build_step = b.addSystemCommand(&.{"tee"});
        build_step.setStdIn(.{
            .bytes = "pub const entrypoint = \"" ++ js_guide.entrypoint ++ "!!!\";",
        });
        const output_file = build_step.addOutputFileArg("foo.zig");
        step.dependOn(&build_step.step);

        var write_step = b.addWriteFiles();
        write_step.addCopyFileToSource(output_file, "src/foo.zig");

        step.dependOn(&write_step.step);

        break :step step;
    };

    const target = b.standardTargetOptions(.{});

    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "guides",

        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    b.installArtifact(exe);

    const run_cmd = b.addRunArtifact(exe);

    run_cmd.step.dependOn(b.getInstallStep());
    run_cmd.step.dependOn(build_js_guide);

    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    const run_step = b.step("run", "Run the app");
    run_step.dependOn(&run_cmd.step);

    const unit_tests = b.addTest(.{
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    const run_unit_tests = b.addRunArtifact(unit_tests);

    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_unit_tests.step);
}
