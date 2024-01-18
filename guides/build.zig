const std = @import("std");

pub fn build(b: *std.Build) void {
    const js_guide = b.step("js-guide", "Build the JS guide.");

    const write_files = b.addWriteFiles();
    _ = write_files.add("index.html", @embedFile("javascript/index.html"));
    _ = write_files.add("bootstrap.js", @embedFile("javascript/bootstrap.js"));

    {
        const lib = addWasmLib(b, .{
            .name = "app",
            .root_source_file = .{ .path = "javascript/entrypoint.zig" },
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

    const serve = b.step("serve", "Build and serve the JS guide.");

    const cmd = b.addSystemCommand(&.{
        "sh",
        "-c",
        b.fmt("cd 'zig-out/js-guide'; python3 -m http.server", .{}),
    });
    cmd.step.dependOn(&install_directory.step);

    serve.dependOn(&cmd.step);
}

const WasmLibOptions = struct {
    // Number of pages reserved for heap memory.
    // This must match the number of pages used in script.js.
    number_of_pages: usize = 2,

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
    mod.global_base = null;
    mod.rdynamic = true;
    mod.import_memory = true;
    mod.stack_size = std.wasm.page_size;

    mod.initial_memory = std.wasm.page_size * options.number_of_pages;
    //mod.max_memory = std.wasm.page_size * number_of_pages;
    mod.entry = .disabled;

    return mod;
}
