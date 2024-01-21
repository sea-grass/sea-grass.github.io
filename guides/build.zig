const std = @import("std");

const app_name = "Wash it!";

pub fn build(b: *std.Build) !void {
    {
        const js_guide = b.step("js-guide", "Build the JS guide.");

        const write_files = b.addWriteFiles();
        const bootstrap_path = "bootstrap.js";
        {
            const index_html = @embedFile("javascript/index.html");
            _ = write_files.add(
                "index.html",
                try std.fmt.allocPrint(b.allocator, index_html, .{
                    .app_name = app_name,
                    .bootstrap_path = bootstrap_path,
                }),
            );
        }

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

    {
        const wws_url = "https://github.com/vmware-labs/wasm-workers-server/releases/download/v1.7.0/wws-linux-musl-x86_64.tar.gz";

        const download_wws_cmd = b.addSystemCommand(&.{
            "curl",
            "-L",
            wws_url,
            "--output",
        });
        download_wws_cmd.expectExitCode(0);
        const archive_path = download_wws_cmd.addOutputFileArg("wws.tar.gz");

        const tar_extract_cmd = b.addSystemCommand(&.{
            "tar",
            "xvf",
        });
        tar_extract_cmd.addFileArg(archive_path);
        tar_extract_cmd.addArgs(&.{
            "./wws",
        });
        const out = b.makeTempPath();
        tar_extract_cmd.setCwd(.{ .path = out });
        const wws_bin_result = b.pathJoin(&.{ out, "wws" });

        const wf = b.addWriteFiles();
        const wws_bin_path = wf.addCopyFile(.{ .path = wws_bin_result }, "wws");

        wf.step.dependOn(&tar_extract_cmd.step);

        //const worker_url = "https://raw.githubusercontent.com/vmware-labs/wasm-workers-server/main/kits/zig/worker/src/worker.zig";
        //const fetch_worker_cmd = b.addSystemCommand(&.{
        //"curl",
        //"-L",
        //worker_url,
        //"--output",
        //});
        //fetch_worker_cmd.expectExitCode(0);
        //const worker_zig_path = fetch_worker_cmd.addOutputFileArg("worker.zig");
        const server = b.addExecutable(.{
            .name = "server",
            .root_source_file = .{ .path = "src/server.zig" },
            .target = b.resolveTargetQuery(.{
                .cpu_arch = .wasm32,
                .os_tag = .wasi,
            }),
            .optimize = .ReleaseSmall,
        });
        server.root_module.addImport("worker", b.createModule(.{
            .root_source_file = .{ .path = "lib/worker/worker.zig" },
        }));
        server.wasi_exec_model = .reactor;

        const echo_cmd = b.addSystemCommand(&.{
            "echo",
            "hi",
            "hi",
        });
        echo_cmd.step.dependOn(&wf.step);
        echo_cmd.addFileArg(wws_bin_path);
        echo_cmd.addFileArg(server.getEmittedBinDirectory());

        const wws_dir = b.addWriteFiles();
        _ = wws_dir.addCopyFile(server.getEmittedBin(), "hello.wasm");

        const run_wws_cmd = b.addSystemCommand(&.{"echo"});
        _ = run_wws_cmd.argv.orderedRemove(0);
        run_wws_cmd.step.dependOn(&wws_dir.step);
        run_wws_cmd.addFileArg(wws_bin_path);
        run_wws_cmd.addDirectoryArg(wws_dir.getDirectory());

        const wws = b.step("wws", "Run wws");
        wws.dependOn(&echo_cmd.step);
        wws.dependOn(&server.step);
        wws.dependOn(&run_wws_cmd.step);
    }
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
