// based on [https://dev.to/grahamthedev/a-noob-learns-ai-my-first-neural-networkin-vanilla-jswith-no-libraries-1f92]
const std = @import("std");

test {
    const input_len = 2;
    const output_len = 4;
    var nn = NeuralNetwork(.{
        .input_len = input_len,
        .output_len = output_len,
        .learning_rate = 0.1,
    }){};
    nn.init();
    defer nn.deinit();

    var prng = std.rand.DefaultPrng.init(0);

    {
        // randomize weights
        for (&nn.weights, 0..) |*inputs, output_index| {
            for (inputs, 0..) |*input, input_index| {
                input.* = 2;
                _ = input_index;
                _ = output_index;
                input.* = prng.random().float(f32);
            }
        }
    }

    {
        // train model
        const TrainingSet = struct {
            inputs: [input_len]f32,
            outputs: [output_len]f32,
        };

        const training_sets = [_]TrainingSet{
            .{
                .inputs = .{ 0, 0 },
                .outputs = .{ 0, 0, 0, 0 },
            },
            .{
                .inputs = .{ 0, 1 },
                .outputs = .{ 0, 0, 0, 0 },
            },
            .{
                .inputs = .{ 1, 0 },
                .outputs = .{ 0, 0, 0, 0 },
            },
            .{
                .inputs = .{ 1, 1 },
                .outputs = .{ 1, 0, 0, 0 },
            },
            .{
                .inputs = .{ -1, -1 },
                .outputs = .{ 0, 0, 0, 1 },
            },
            .{
                .inputs = .{ 1, -1 },
                .outputs = .{ 0, 0, 1, 0 },
            },
            .{
                .inputs = .{ -1, 1 },
                .outputs = .{ 0, 1, 0, 0 },
            },
            .{
                .inputs = .{ 0, -1 },
                .outputs = .{ 0, 0, 0, 0 },
            },
            .{
                .inputs = .{ -1, 0 },
                .outputs = .{ 0, 0, 0, 0 },
            },
        };

        for (0..1_000) |iter| {
            _ = iter;
            for (training_sets) |training_set| {
                nn.train(training_set.inputs, training_set.outputs);
            }
        }

        // run against expected outputs
        for (training_sets) |training_set| {
            var outputs = nn.propagate(training_set.inputs);
            for (&outputs) |*o| {
                o.* = if (o.* < 0.5) 0 else 1;
            }

            std.testing.expectEqualSlices(f32, &training_set.outputs, &outputs) catch {
                std.debug.print("Failed case -- \n", .{});
                std.debug.print("\n\n in: ", .{});
                std.debug.print("{any} ", .{training_set.inputs});
                std.debug.print("\n", .{});
                std.debug.print("out: ", .{});
                std.debug.print("{any} ", .{outputs});
                std.debug.print("\n", .{});
                std.debug.print("exp: ", .{});
                std.debug.print("{any} ", .{training_set.outputs});
                std.debug.print("\n\n", .{});
            };
        }
    }
}

const InitOptions = struct {
    input_len: usize,
    output_len: usize,
    learning_rate: f32,
};

fn NeuralNetwork(comptime options: InitOptions) type {
    return struct {
        weights: [options.output_len][options.input_len]f32 = undefined,
        bias: [options.output_len]f32 = undefined,

        const Self = @This();
        pub fn init(nn: *Self) void {
            nn.* = .{
                .weights = std.mem.zeroes([options.output_len][options.input_len]f32),
                .bias = std.mem.zeroes([options.output_len]f32),
            };
        }

        pub fn deinit(nn: *Self) void {
            _ = nn;
        }

        pub fn propagate(self: Self, inputs: [options.input_len]f32) [options.output_len]f32 {
            var outputs = [options.output_len]f32{ 0, 0, 0, 0 };
            for (&outputs, 0..) |*output, output_index| {
                for (0..options.input_len) |input_index| {
                    output.* += self.weights[output_index][input_index] * inputs[input_index];
                }

                output.* += self.bias[output_index];
                output.* = Self.sigmoid(output.*);
            }

            return outputs;
        }

        pub fn train(self: *Self, inputs: [options.input_len]f32, target: [options.output_len]f32) void {
            const outputs = self.propagate(inputs);
            var errors = [options.output_len]f32{ 0, 0, 0, 0 };

            for (
                &self.weights,
                &errors,
                &self.bias,
                target,
                outputs,
            ) |
                *output_weights,
                *err,
                *bias,
                expected_output,
                output,
            | {
                err.* = expected_output - output;
                for (output_weights, &inputs) |*input_weight, input| {
                    input_weight.* += options.learning_rate * err.* * output * (1 - output) * input;
                }
                bias.* += options.learning_rate * err.*;
            }
        }

        pub fn sigmoid(value: f32) f32 {
            return 1 / (1 + @exp(-value));
        }
    };
}
