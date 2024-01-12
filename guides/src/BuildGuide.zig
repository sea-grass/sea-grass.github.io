// Based on WriteFile in the zig repo

const std = @import("std");

const Step = std.Build.Step;
const BuildGuide = @This();
const BuildGuideOptions = struct {
    entrypoint: []const u8,
    prefix_install_path: []const u8,
};

step: Step,
entrypoint: []const u8,
prefix_install_path: []const u8,

pub const base_id = .build_guide;

pub fn create(owner: *std.Build, options: BuildGuideOptions) *BuildGuide {
    const bg = owner.allocator.create(BuildGuide) catch @panic("OOM");
    bg.* = .{
        .entrypoint = owner.dupe(options.entrypoint),
        .prefix_install_path = owner.dupe(options.prefix_install_path),
        .step = Step.init(.{
            .id = .custom,
            .name = "BuildGuide",
            .owner = owner,
            .makeFn = make,
        }),
    };
    return bg;
}

fn make(step: *Step, prog_node: *std.Progress.Node) !void {
    _ = prog_node;
    var b = step.owner;
    const bg = @fieldParentPtr(BuildGuide, "step", step);

    const out_files = b.addWriteFiles();

    {
        _ = out_files.add(
            "index.html",
            "<!doctype html><html><head><script src=\"bootstrap.js\" defer></script></head><body><p>Hello, world!</p></body></html>",
        );
    }

    {
        _ = out_files.add(
            "bootstrap.js",
            "WebAssembly.instantiateStreaming(fetch(\"app.wasm\"), {env:{print(num) {  console.log('env.print', num); },  },imports:{print: (num) => { console.log(num); }}}).then((obj) => { console.log(obj.instance.exports); });",
        );
    }

    const install_dir = b.addInstallDirectory(.{
        .source_dir = out_files.getDirectory(),
        .install_dir = .prefix,
        .install_subdir = bg.prefix_install_path,
    });

    install_dir.step.dependOn(&out_files.step);
    step.dependOn(&install_dir.step);

    const lib = b.addSharedLibrary(.{
        .name = "js-guide-app",
        .root_source_file = .{ .path = "javascript/guide.zig" },
        .target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        },
        .optimize = .ReleaseSmall,
    });

    lib.rdynamic = true;
    lib.export_symbol_names = &[_][]const u8{
        "add",
    };

    const install_wasm_bin = b.addInstallFile(lib.getEmittedBin(), "js-guide/app.wasm");
    install_wasm_bin.step.dependOn(&lib.step);

    step.dependOn(&install_wasm_bin.step);
}
