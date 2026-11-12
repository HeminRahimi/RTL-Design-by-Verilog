---
layout: default
title: "7. Behavioral Modeling"
---

# 7. Behavioral modeling

## 7.1 The idea

Behavioral modeling describes **what** a circuit does using procedural blocks, rather than **how** it is built from gates. It is the highest of the four modeling levels and is where almost all real RTL is written — especially sequential logic.

The two procedural blocks are:

| Block | Runs | Synthesizable | Use |
|---|---|---|---|
| `always` | Repeatedly, triggered by its sensitivity list | Yes | Design |
| `initial` | Once, at time 0 | No | Testbenches only |

This lesson covers **`always`**. `initial` belongs to lesson 8 (verification).

## 7.2 Sensitivity lists

```verilog
always @(*)              // combinational: re-run whenever any input changes
always @(a or b or c)    // equivalent explicit form (older style)
always @(posedge clk)    // sequential: run on the rising edge only
always @(posedge clk or posedge reset)   // sequential with async reset
```

- `@(*)` is the correct, complete way to write a combinational block. Never list signals by hand; you will forget one and infer a latch.
- `posedge` / `negedge` mean "rising / falling edge". This is what infers a flip-flop.

## 7.3 Combinational vs. sequential `always` blocks

| | Combinational | Sequential |
|---|---|---|
| Sensitivity | `@(*)` | `@(posedge clk)` or `@(posedge clk or posedge reset)` |
| Assignment | **Blocking** `=` | **Non-blocking** `<=` |
| Becomes | Gates | Flip-flops |
| Must assign every output on every path | Yes, or you infer a latch | No |

## 7.4 The blocking / non-blocking rule

This is the most important rule in behavioral Verilog:

> **Use `=` (blocking) in combinational blocks. Use `<=` (non-blocking) in sequential blocks. Never mix them in the same block.**

Why:

- `=` executes immediately, in order. That models a chain of gates — correct for combinational logic.
- `<=` schedules the update for the end of the current time step. That models all flip-flops updating **simultaneously** on the clock edge — correct for sequential logic.

Mixing them causes simulation/synthesis mismatch: the simulator and the synthesis tool will disagree about your circuit. This is one of the most expensive classes of bug in digital design.

## 7.5 Latches: the accidental circuit

In a combinational block, **every output must be assigned on every possible path**. If an output is not assigned in some branch, the tool must hold its previous value — which requires a latch.

```verilog
// BUG: latch inferred
always @(*) begin
    if (en)
        y = a;        // when en == 0, y is never assigned → latch
end

// CORRECT: no latch
always @(*) begin
    if (en)
        y = a;
    else
        y = 1'b0;     // default
end
```

A latch is almost never what you want. Synthesis will warn you; do not ignore the warning.

## 7.6 Example 1 — D flip-flop with asynchronous reset

```verilog
// examples/behavioral_dff.v
module dff (clk, reset, d, q);

     input  clk, reset, d;
     output q;
     reg    q;

     always @(posedge clk or posedge reset) begin
          if (reset)
               q <= 1'b0;
          else
               q <= d;
     end

endmodule
```

Points to notice:

- `output q; reg q;` — in Verilog‑1995 style, an output assigned inside `always` must also be declared `reg`. The two declarations are combined into "output register".
- `posedge reset` in the sensitivity list makes the reset **asynchronous**: `q` clears the instant `reset` goes high, independent of the clock.
- `<=` is used because this is a sequential block.
- If you wanted a **synchronous** reset, you would write `always @(posedge clk)` and test `reset` inside the block.

**Timing diagram:**

```text
clk    _/‾\_/‾\_/‾\_/‾\_
reset  ‾‾‾\_______/‾‾‾‾‾‾‾‾
d      ___/‾‾‾\___/‾‾‾\___
q      ___/‾‾‾\___/‾‾‾\___   (q follows d only while reset is low)
```

## 7.7 Example 2 — 4:1 multiplexer

```verilog
// examples/behavioral_mux4.v
module mux4to1 (sel, in, out);

     input  [1:0] sel;
     input  [3:0] in;
     output       out;
     reg          out;

     always @(*) begin
          case (sel)
               2'b00: out = in[0];
               2'b01: out = in[1];
               2'b10: out = in[2];
               2'b11: out = in[3];
               default: out = 1'b0;
          endcase
     end

endmodule
```

Points to notice:

- `@(*)` makes this combinational.
- `=` blocking assignment, because it is combinational.
- The `default` branch is defensive. With `sel` 2 bits wide all four cases are covered, so it is redundant here — but it is good practice and costs nothing.
- `out` is declared `reg` (via `output out; reg out;`) because it is assigned inside a procedural block.

**Truth table:**

| sel | out |
|---|---|
| 00 | in[0] |
| 01 | in[1] |
| 10 | in[2] |
| 11 | in[3] |

## 7.8 Example 3 — 4-bit up counter with asynchronous reset

```verilog
// examples/behavioral_counter4.v
module counter4 (clk, reset, q);

     input            clk, reset;
     output     [3:0] q;
     reg        [3:0] q;

     always @(posedge clk or posedge reset) begin
          if (reset)
               q <= 4'b0000;
          else
               q <= q + 4'd1;
     end

endmodule
```

Points to notice:

- Sequential block → `<=`.
- `reset` is asynchronous because it appears in the sensitivity list with `posedge`.
- `q + 4'd1` on a 4-bit signal wraps from 15 to 0 with no extra code, because 4-bit arithmetic is modulo 16.
- The counter is 4 bits wide, so it counts 0–15.

## 7.9 Other procedural constructs

### `if` / `else if` / `else`

```verilog
always @(*) begin
    if (a > b)      max = a;
    else if (b > a) max = b;
    else            max = a;
end
```

### `case`, `casez`, `casex`

```verilog
case (opcode)
    3'b000: y = a + b;
    3'b001: y = a - b;
    default: y = 0;
endcase
```

- `casez` treats `z` and `?` as don't-care. Useful for priority decoders.
- `casex` treats `x` and `z` as don't-care. **Avoid it** — it can mask real X-propagation bugs.

### `for`

```verilog
integer i;
always @(*) begin
    parity = 1'b0;
    for (i = 0; i < 8; i = i + 1)
        parity = parity ^ data[i];
end
```

In synthesis the loop is **unrolled** into parallel hardware. The loop variable must be an `integer` (or a `genvar` in a `generate` block).

### `while`, `repeat`, `forever`

Synthesizable only when they unroll to a fixed number of iterations. `forever` is used almost exclusively in testbenches.

## 7.10 Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| `=` in a clocked block | Simulation/synthesis mismatch, races | Use `<=` |
| `<=` in a combinational block | Simulation races | Use `=` |
| Missing `else` in a combinational block | Inferred latch | Provide a default |
| Incomplete `@(...)` list | Simulation/synthesis mismatch | Use `@(*)` |
| Assigning to a `wire` inside `always` | Compile error | Declare the target `reg` |
| Two `always` blocks driving one signal | Multiple drivers, `x` | One driver per signal |
| `integer` in a `for` loop without declaration | Compile error (Verilog‑2001) | Declare `integer i;` |

## 7.11 Synthesis view

| Code pattern | Hardware |
|---|---|
| `always @(posedge clk)` with `<=` | D flip-flops |
| `always @(*)` with `=` | Combinational gates |
| `if (reset)` with `reset` in the sensitivity list | Async reset pin on the flip-flop |
| `case` on `sel` | Multiplexer |
| `q <= q + 1` | Counter (adder + register) |
| Incomplete `if` in `@(*)` | **Latch** (usually unwanted) |

## 7.12 Key takeaways

1. `always` is the behavioral workhorse; `initial` is for testbenches only.
2. `@(*)` = combinational; `@(posedge clk)` = sequential.
3. `=` in combinational, `<=` in sequential. Never mix.
4. Assign every output on every path in a combinational block, or you get a latch.
5. Anything assigned in an `always` block must be declared `reg` — in 1995 style: `output q; reg q;`.

**Next:** [Verification with testbenches →](08-verification.html)
