---
layout: default
title: "9. Essential Verilog Concepts"
---

# 9. Essential Verilog concepts

Lessons 1–8 taught the four modeling levels and verification. This lesson collects the **rules and concepts that cut across all levels** — the ones that cause most beginner bugs and that interviewers and reviewers expect you to know cold. None of it is new syntax; all of it is about **semantics**.

## 9.1 Modules are concurrent hardware

A Verilog module is not a function. It is a **physical block** that exists and operates **all the time**, in parallel with every other block.

```verilog
module top;
     wire a, b, y1, y2;

     gate_nand u1 (a, b, y1);
     gate_nand u2 (a, b, y2);
endmodule
```

Both `u1` and `u2` are always present. Neither "runs before" the other. In hardware they are two gates sitting side by side on the die.

The same is true of:

- **`assign` statements** — continuous, always active[reference:0].
- **`always` blocks** — all execute concurrently; the order they appear in the file has no meaning[reference:1][reference:2].
- **Module instances** — all run in parallel, regardless of the order they are written[reference:3].

## 9.2 Instantiation: named vs positional

A module is used inside another module by **instantiating** it.

```verilog
// Positional: order must match the module's port list exactly
gate_nand u1 (a, b, y);

// Named: order does not matter
gate_nand u2 (.a(a), .b(b), .y(y2));
```

| Style | Syntax | Order matters? | Risk |
|---|---|---|---|
| **Positional** | `gate_nand u1 (a, b, y);` | **Yes** — first signal goes to first port | A port-order change in the child module silently breaks every parent[reference:4] |
| **Named** | `gate_nand u2 (.a(a), .b(b), .y(y2));` | **No** — matched by port name | Verbose, but immune to reordering[reference:5] |

**Rule:** use **named connections** for anything with more than two or three ports[reference:6]. Positional is acceptable only for tiny primitives like `nand g1 (y, a, b);`.

Named and positional **cannot be mixed in one instantiation**[reference:7].

## 9.3 Order does not matter

Because everything is concurrent:

```verilog
// These two modules are identical in hardware
module m1;
     wire y;
     assign y = a & b;
     assign z = c | d;
endmodule

module m2;
     wire y;
     assign z = c | d;
     assign y = a & b;
endmodule
```

The two `assign` statements are parallel gates. Swapping them changes nothing[reference:8].

The same applies to `always` blocks:

```verilog
always @(posedge clk) q1 <= d1;
always @(posedge clk) q2 <= d2;
```

Reversing the two lines produces the same two flip-flops. The only place order matters is **inside a single `begin ... end` block with blocking assignments** (see 9.4).

## 9.4 Blocking vs non-blocking assignments

| Operator | Name | Evaluation | Infers | Use in |
|---|---|---|---|---|
| `=` | **Blocking** | Immediate: RHS evaluated, LHS assigned before next statement | Combinational logic | `always @(*)` |
| `<=` | **Non-blocking** | Scheduled: RHS evaluated now, LHS updated at end of time step | Flip-flops | `always @(posedge clk)` |

**Rule of thumb:** `=` for combinational, `<=` for sequential[reference:9][reference:10].

### Why it matters — the shift-register trap

```verilog
// WRONG: two parallel registers, not a shift register
always @(posedge clk) begin
     ff1 = data_in;   // blocking
     ff2 = ff1;       // ff1 was just updated → ff2 gets data_in
end

// CORRECT: true shift register
always @(posedge clk) begin
     ff1 <= data_in;  // non-blocking
     ff2 <= ff1;      // ff1 still holds the OLD value → correct shift
end
```

With blocking assignments, the first assignment completes before the second reads `ff1`, so both registers capture `data_in` in the same cycle. With non-blocking, both RHS values are evaluated using the **old** values, then both are updated — which is exactly how real flip-flops behave[reference:11].

### Mixing in one block

Blocking and non-blocking **can coexist in one clocked block only if their roles are clearly separated**: blocking for temporary combinational calculations, non-blocking for the actual state update[reference:12]. For beginners the safe rule is: **never mix them in the same block.**

## 9.5 Sensitivity lists: combinational vs sequential

| | Combinational | Sequential |
|---|---|---|
| Trigger | Any input change | Clock edge |
| Syntax | `always @(*)` or `always @*` | `always @(posedge clk)` |
| Must list every read signal? | **Yes** — `@(*)` does it automatically | **No** — only the clock (and async reset) |
| Assignment | `=` blocking | `<=` non-blocking |

**Combinational:** the sensitivity list must contain **every** signal read inside the block. `@(*)` (or `@*`) is the compiler-checked way to guarantee this — never write the list by hand[reference:13][reference:14]. A missing signal means the output does not update when that input changes → simulation/synthesis mismatch, or an inferred latch.

**Sequential:** the list contains the clock edge, and optionally an asynchronous reset edge:

```verilog
always @(posedge clk)                      // synchronous design
always @(posedge clk or posedge reset)     // async reset
```

**Mixing edge and level in the same list is illegal:**

```verilog
always @(clear or negedge clock)   // ERROR: one edge, one level
```

If one signal uses `posedge`/`negedge`, **all** must[reference:15].

## 9.6 Left-hand-side rules: wire vs reg

The left-hand side of an assignment is restricted by the construct used.

| Construct | Legal LHS | Illegal LHS |
|---|---|---|
| `assign` (continuous) | `wire` (net) | `reg`[reference:16] |
| `always` / `initial` | `reg` (variable) | `wire`[reference:17][reference:18] |
| Gate primitive output | `wire` | `reg` |
| Module input port | — | always a net (`wire`)[reference:19] |
| Module output port | `wire` **or** `reg` | —[reference:20] |

So a module output driven by `assign` is a `wire`; the same output driven inside `always` must be declared `reg`:

```verilog
// Output driven by assign → wire
module m1 (a, b, y);
     input  a, b;
     output y;          // wire by default
     assign y = a & b;
endmodule

// Output driven by always → reg
module m2 (clk, d, q);
     input  clk, d;
     output q;
     reg    q;          // must also be reg
     always @(posedge clk) q <= d;
endmodule
```

When instantiating a module, the **parent's signal** connected to a child **output** must be a `wire`, not a `reg`[reference:21].

## 9.7 One driver per net

A net may be driven by **exactly one** source: one `assign`, one gate output, or one `always` block — never more than one.

```verilog
// WRONG: two drivers on out1
wire out1;
assign out1 = in1;
assign out1 = in2;

// CORRECT: one driver, explicit selection
assign out1 = sel ? in2 : in1;
```

Synthesis reports this as **"multi-driven net"** and either keeps the last driver or refuses to elaborate[reference:22]. In simulation the value becomes `X` when the two drivers disagree. The fix is always the same: **merge the drivers into one expression or one block**[reference:23].

## 9.8 Implicit nets — avoid them

If you use an undeclared identifier on the LHS of an `assign` or as a port connection, Verilog silently creates a **1-bit implicit wire**:

```verilog
assign y = a & b;   // if y was never declared, a 1-bit wire appears
```

This hides typos and width bugs. Force the compiler to reject them:

```verilog
`default_nettype none
```

Put that directive at the top of every design file. Every undeclared net then becomes a compile error instead of a silent 1-bit wire. Add `` `default_nettype wire `` back at the end if other files depend on the old behaviour.

## 9.9 Generate blocks

`generate` builds **repetitive hardware** at elaboration time. It is not a runtime loop; it is a structural copy.

```verilog
genvar i;
generate
     for (i = 0; i < 4; i = i + 1) begin : gen_ff
          dff u_ff (.clk(clk), .reset(reset), .d(d[i]), .q(q[i]));
     end
endgenerate
```

This creates **four** `dff` instances, named `gen_ff[0].u_ff`, `gen_ff[1].u_ff`, etc. The loop is unrolled before simulation; nothing loops at runtime.

`generate` is the correct tool when you want *N copies of a module*. For *N parallel operations inside one block*, use a plain `for` inside `always @(*)` — it also unrolls, but stays within one procedural block.

## 9.10 Parameters

A `parameter` makes a module reusable at different widths without editing its body.

```verilog
module counter #(parameter WIDTH = 4) (clk, reset, q);

     input              clk, reset;
     output [WIDTH-1:0] q;
     reg    [WIDTH-1:0] q;

     always @(posedge clk or posedge reset)
          if (reset) q <= {WIDTH{1'b0}};
          else       q <= q + 1'b1;

endmodule
```

Instantiate with the default (`counter u1 (...)`) or override:

```verilog
counter        u4  (.clk(clk), .reset(rst), .q(q4));    // WIDTH = 4
counter #(.WIDTH(8)) u8 (.clk(clk), .reset(rst), .q(q8)); // WIDTH = 8
```

Use **named parameter override** (`#(.WIDTH(8))`) for the same reason as named ports: order independence and readability.

## 9.11 Signed arithmetic

Verilog treats every signal as **unsigned** unless you say otherwise. Mixing signed and unsigned silently changes results.

```verilog
wire signed [7:0] a, b;
wire signed [8:0] sum;
assign sum = a + b;          // signed add, 9-bit result
```

Rules:

- Declare with `signed` on both the port and the internal signal.
- `$signed(x)` and `$unsigned(x)` convert explicitly when needed.
- A comparison between a signed and an unsigned operand is performed as **unsigned** — always check both sides.

## 9.12 Latch inference

A latch appears when a combinational `always @(*)` block does **not** assign an output on every path:

```verilog
// LATCH (unwanted)
always @(*) begin
     if (en) y = a;    // en = 0 → y not assigned → must hold → latch
end

// NO LATCH
always @(*) begin
     if (en) y = a;
     else    y = 1'b0; // default on every path
end
```

Synthesis warns; do not ignore it. A latch is level-sensitive, breaks static timing analysis, and is almost never intended.

## 9.13 Race conditions

Two `always` blocks writing the same `reg`, or a testbench changing a stimulus exactly on a clock edge, produces **non-deterministic** results. They simulate differently on different tools.

Rules:

- One writer per `reg` — merge the logic into one block.
- In a testbench, drive stimulus **between** clock edges (`#2` after the edge), or use non-blocking assignment in the testbench.
- Never rely on the order of two `always` blocks.

## 9.14 Key takeaways

1. **Everything is concurrent.** Module instances, `assign` statements, and `always` blocks all run in parallel; file order is irrelevant.
2. **Use named port connections** (`.port(signal)`) for any module with more than a couple of ports.
3. **`=` for combinational, `<=` for sequential.** Never mix in one block.
4. **`@(*)` for combinational; `@(posedge clk)` for sequential.** Never hand-write a combinational sensitivity list.
5. **`assign` drives `wire`; `always` drives `reg`.** An output is `wire` or `reg` depending on what drives it.
6. **Exactly one driver per net.** Multiple drivers produce `X` in simulation and "multi-driven net" in synthesis.
7. **Add `` `default_nettype none ``** to catch implicit 1-bit wires.
8. **`generate` copies hardware; a `for` inside `always` unrolls logic.** Know which one you need.
9. **Parameters + named override** make modules reusable without editing them.
10. **A missing `else` in `@(*)` infers a latch.** Assign every output on every path.

**Back to:** [Course home](index.html)
