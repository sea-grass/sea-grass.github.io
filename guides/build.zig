const std = @import("std");

// Number of pages reserved for heap memory.
// This must match the number of pages used in script.js.
const number_of_pages = 2;

pub fn build(b: *std.Build) void {
    const js_guide = b.step("js-guide", "Build the JS guide.");

    const write_files = b.addWriteFiles();
    _ = write_files.add(
        "index.html",
        "<!doctype html><html><head><script src=\"bootstrap.js\" defer></script></head><body><p>Hello, world!</p></body></html>",
    );
    _ = write_files.add(
        "bootstrap.js",
        "WebAssembly.instantiateStreaming(fetch(\"app.wasm\"), {env:{print(num) {  console.log('env.print', num); },  },imports:{print: (num) => { console.log(num); }}}).then((obj) => { console.log(obj.instance.exports); });",
    );

    {
        const lib = addWasmLib(b, .{
            .name = "app",
            .root_source_file = .{ .path = "javascript/guide.zig" },
        });
        _ = write_files.addCopyFile(lib.getEmittedBin(), "app.wasm");
    }

    const install_directory = b.addInstallDirectory(.{
        .source_dir = write_files.getDirectory(),
        .install_dir = .{
            .custom = "js-guide",
        },
        .install_subdir = "",
    });
    install_directory.step.dependOn(&write_files.step);
    js_guide.dependOn(&install_directory.step);
}

const WasmLibOptions = struct {
    name: []const u8,
    root_source_file: std.Build.LazyPath,
};

// <https://ziggit.dev/t/building-a-wasm-shared-library-that-does-not-import-memory-from-the-environment/2240>
fn addWasmLib(b: *std.Build, options: WasmLibOptions) *std.Build.Step.Compile {
    const mod = b.addExecutable(.{
        .name = options.name,
        .root_source_file = options.root_source_file,
        .target = b.resolveTargetQuery(.{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        }),
        .optimize = .ReleaseSmall,
    });
    mod.rdynamic = true;
    mod.entry = .disabled;

    return mod;
}
