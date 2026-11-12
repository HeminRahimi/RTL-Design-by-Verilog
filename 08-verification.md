---
layout: default
title: "8. Verification with Testbenches"
---

# 8. Verification with testbenches

> **Verification is not a modeling level.** It is an independent activity that follows design. The four design levels were switch, gate, dataflow, and behavioral. Verification is a separate discipline with its own constructs, its own tools, and its own goal: **proving that a design behaves as specified.**

## 8.1 Why verification is a separate topic

| | Design (lessons 4–7) | Verification (this lesson) |
|---|---|---|
| Question answered | "What is the circuit?" | "Does the circuit do what I intended?" |
| Constructs | `assign`, `always`, primitives | `initial`, `#delay`, `$display`, `$dumpfile` |
| Synthesizable | Yes | **No** |
| Goes to silicon | Yes | Never |
| Written by | RTL designer | Verification engineer (often a different person) |

The same testbench can verify a design written at **any** of the four levels. That is why verification sits outside the level hierarchy.

## 8.2 The testbench concept

A testbench is a Verilog module that:

1. **Instantiates** the design under test (DUT),
2. **Applies stimulus** to the DUT's inputs,
3. **Observes** the DUT's outputs,
4. **Checks** that the observations match expectations,
5. **Records** the waveform for human inspection.

```text
   ┌──────────────────────────┐
   │        testbench         │
   │                          │
   │  stimulus ──►┌────────┐  │
   │              │  DUT   │──┼──► observed outputs
   │              └────────┘  │
   │                          │
   │  $dumpfile / $monitor    │
   └──────────────────────────┘
```

The testbench has **no ports**. It is the top module of the simulation.

## 8.3 Non-synthesizable constructs used here

| Construct | Purpose |
|---|---|
| `initial begin ... end` | Run once at time 0 — this is where stimulus lives |
| `#10` | Wait 10 time units |
| `$dumpfile("f.vcd")` | Name the waveform file |
| `$dumpvars(level, module)` | Select which signals to record |
| `$display(...)` | Print a formatted line |
| `$monitor(...)` | Print automatically whenever a listed signal changes |
| `$finish` | End the simulation |
| `$time` | Current simulation time |
| `$random` | Random stimulus |

None of these can be synthesized. That is exactly why testbenches are a separate topic.

## 8.4 Example 1 — testbench for the D flip-flop (sequential)

This testbench drives a clock and checks the DFF of lesson 7.

```verilog
// examples/tb_dff.v
module tb_dff;

     reg  clk, reset, d;
     wire q;

     dff uut (
          .clk   (clk),
          .reset (reset),
          .d     (d),
          .q     (q)
     );

     initial clk = 1'b0;
     always #5 clk = ~clk;

     initial begin
          $dumpfile("tb_dff.vcd");
          $dumpvars(0, tb_dff);

          reset = 1'b1; d = 1'b0;
          #12 reset = 1'b0; d = 1'b1;
          #10 d = 1'b0;
          #10 d = 1'b1;
          #10 d = 1'b0;
          #10 $finish;
     end

     initial begin
          $monitor("t=%0t  reset=%b  d=%b  q=%b", $time, reset, d, q);
     end

endmodule
```

### What each part does

| Part | Lines | Purpose |
|---|---|---|
| Instantiation | `dff uut (...)` | Connect the testbench signals to the DUT ports. `uut` = unit under test. |
| Clock | `always #5 clk = ~clk;` | Free-running 10 ns clock. `always` without an event control is legal in a testbench and runs forever. |
| Stimulus | `initial begin ... end` | A scripted sequence of input changes. |
| Dump | `$dumpfile` / `$dumpvars` | Produce the VCD file GTKWave reads. |
| Observation | `$monitor` | Print the state at every change. |

### What to check in the waveform

| Time | reset | Expected `q` |
|---|---|---|
| 0–12 ns | 1 | `0`, immediately when `reset` rises — **asynchronously**, not on a clock edge |
| 12 ns onward | 0 | `q` takes the value of `d` present **just before** each rising clock edge |
| Any time | — | `q` never changes except on a clock edge or on `reset` rising |

If `q` changes at any other time, the design is wrong.

## 8.5 Example 2 — testbench for the 4:1 multiplexer (combinational)

Combinational designs are verified with **exhaustive stimulus**: apply every input combination and compare the output with the expected function.

```verilog
// examples/tb_mux4.v
module tb_mux4;

     reg  [1:0] sel;
     reg  [3:0] in;
     wire       out;

     mux4to1 uut (
          .sel (sel),
          .in  (in),
          .out (out)
     );

     integer s;

     initial begin
          $dumpfile("tb_mux4.vcd");
          $dumpvars(0, tb_mux4);

          in = 4'b1010;

          for (s = 0; s < 4; s = s + 1) begin
               sel = s;
               #10;
               $display("sel=%b  in=%b  out=%b  expected=%b", sel, in, out, in[s]);
               if (out !== in[s])
                    $display("   *** MISMATCH ***");
          end

          $finish;
     end

endmodule
```

### What is new here

- **Exhaustive loop.** The `for` loop applies all four `sel` values. A complete combinational testbench covers the entire input space (or a representative sample when the space is large).
- **Self-checking.** The `if (out !== in[s])` line prints a mismatch. This is the beginning of a **self-checking testbench** — the foundation of professional verification.
- **`!==` instead of `!=`.** Case inequality treats `x` and `z` as literal values, so a design that outputs `x` is flagged as a failure rather than silently passing.

### Expected output

```text
sel=00  in=1010  out=0  expected=0
sel=01  in=1010  out=1  expected=1
sel=10  in=1010  out=0  expected=0
sel=11  in=1010  out=1  expected=1
```

No `*** MISMATCH ***` lines means the design passed.

## 8.6 Running both simulations

```bash
# Sequential DUT
iverilog -g2012 -Wall -o sim_dff examples/tb_dff.v examples/behavioral_dff.v
vvp sim_dff
gtkwave tb_dff.vcd

# Combinational DUT
iverilog -g2012 -Wall -o sim_mux examples/tb_mux4.v examples/behavioral_mux4.v
vvp sim_mux
gtkwave tb_mux4.vcd
```

## 8.7 Reading the waveform in GTKWave

1. **File → Open New File** → select the `.vcd`.
2. In the left panel, expand `tb_dff` → `uut` to see DUT internals.
3. Drag `clk`, `reset`, `d`, `q` into the waveform pane.
4. Use **View → Zoom → Zoom Fit** to see the whole run.
5. Place the cursor on a rising edge of `clk`; the values at that instant appear in the top bar.
6. Check: does `q` change only at clock edges (when `reset` is low) and when `reset` rises?

## 8.8 Common testbench mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| `wire` for a signal driven in `initial` | Compile error / stuck at `x` | Use `reg` for driven signals |
| Missing `$dumpfile` | No `.vcd` produced | Add both `$dumpfile` and `$dumpvars` |
| Missing `$finish` | Simulation runs forever | Add `$finish` at the end |
| Stimulus changes exactly on the clock edge | Race, non-deterministic results | Change stimulus a few ns after the edge (`#5` style), or use non-blocking assignment in the testbench |
| Forgetting to compile the DUT | "Unknown module" error | List **all** `.v` files on the `iverilog` line |
| `$monitor` inside a clocked block | Floods the console | Put `$monitor` in its own `initial` block |

## 8.9 Toward professional verification

The testbenches in this lesson are **directed** and only partially self-checking. The professional progression is:

1. **Self-checking testbenches** — every check is automated (as in `tb_mux4.v`).
2. **Constrained-random stimulus** — thousands of random cases instead of a few hand-picked ones.
3. **Functional coverage** — measure which parts of the specification were exercised.
4. **Assertions (SVA)** — state properties that must always hold (`q` never changes without a clock edge).
5. **Formal verification** — mathematically prove properties over all inputs.
6. **UVM** — the industry-standard verification methodology, built on SystemVerilog.

All of these are extensions of the same idea you have just learned: **instantiate the DUT, drive it, observe it, check it.**

## 8.10 Key takeaways

1. Verification is a **separate topic**, not a fifth modeling level.
2. A testbench has no ports and is the top module of a simulation.
3. `initial` + `#delay` produce stimulus; `$dumpfile`/`$dumpvars` produce the waveform; `$monitor`/`$display` report results.
4. Combinational DUTs are tested exhaustively; sequential DUTs are tested against a clock.
5. A testbench that checks its own results is the foundation of all professional verification.

**Back to:** [Course home](index.html)
