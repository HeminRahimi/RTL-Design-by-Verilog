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

## 9.14 Value types and number literals

Every signal in Verilog carries a **value**, and every literal in the source has a **size**, a **base**, and a **signedness**. Getting these three attributes right is the difference between a design that simulates correctly and one that silently truncates.

### 9.14.1 The four-valued logic

Verilog signals are not two-valued. Each bit holds one of four values:

| Value | Name | Appears when |
|---|---|---|
| `0` | logic low | Driven low by a gate, `assign`, or procedural assignment |
| `1` | logic high | Driven high |
| `x` | unknown | Uninitialised `reg`; two drivers contending on one net; out-of-range index; unconnected input |
| `z` | high impedance | Undriven tri-state net; explicit `1'bz` |

`x` and `z` are **simulation concepts**. Synthesis maps `x` to a don't-care and treats `z` as an error unless it is a genuine tri-state buffer being inferred. A design whose simulation shows `x` is not "almost working" — it has a real bug: uninitialised state, multiple drivers (see 9.7), or a read of an out-of-range index.

```verilog
module xz_demo;
     reg        uninit;      // starts as x
     wire       y;
     reg  [3:0] v;

     assign y = 1'bz;        // explicitly high-impedance

     initial begin
          v = 4'b10x1;       // a literal containing x is legal
          $display("uninit=%b y=%b v=%b", uninit, y, v);
          $finish;
     end
endmodule
```

**Expected output:**

```
uninit=x y=z v=10x1
```

> A literal may contain `x` and `z`, but only in a **based** number: `4'b10x1` is legal, `4'dx1` is not.

### 9.14.2 Number literal syntax

The general form is:

```
<size>'<base><digits>
```

| Field | Meaning | Examples |
|---|---|---|
| `<size>` | Width in bits (decimal, optional) | `4`, `8`, `16` |
| `'` | Separator — mandatory for based literals | `'` |
| `<base>` | `b` binary, `o` octal, `d` decimal, `h` hex — case-insensitive; prefix with `s` for signed | `b`, `h`, `sd` |
| `<digits>` | Digits in that base; underscores `_` are ignored | `1010`, `FF`, `1_0000` |

| Literal | Width | Value |
|---|---|---|
| `4'b1010` | 4 | 10 (binary) |
| `8'hA5` | 8 | 165 |
| `16'd4660` | 16 | 4660 |
| `12'o777` | 12 | 511 |
| `4'shF` | 4, signed | −1 |
| `8'b1010_1010` | 8 | 170 (underscores ignored) |

### 9.14.3 Sized vs unsized — the rule that bites

| Form | Width | Signedness | Example |
|---|---|---|---|
| Plain decimal | **32** | **signed** | `255`, `-3` |
| Based, no size | **32** | **unsigned** | `'hFF`, `'b1010` |
| Based, with size | the size | unsigned unless `s` | `4'hF` (unsigned), `4'shF` (signed) |

The inconsistency in the first two rows is a historical wart. `255` is a signed 32-bit value; `'d255` is an unsigned 32-bit value. They compare and extend differently when mixed with narrower signals.

**Avoid unsized literals in RTL.** Write `8'd255`, not `255`. The size is documentation and it prevents width surprises.

SystemVerilog adds the **fill literals** `'0`, `'1`, `'x`, `'z`, which set every bit of the target to that value regardless of width. `iverilog -g2012` accepts them:

```verilog
reg [31:0] zeroed;
zeroed = '0;          // all 32 bits zero, no matter the width
```

In plain Verilog‑1995 the equivalent is the replication operator: `zeroed = {32{1'b0}};`.

### 9.14.4 Data types

| Type | Kind | Width | Assigned by | Synthesizable |
|---|---|---|---|---|
| `wire` | net | 1 or vector | `assign`, gate output, module output | Yes |
| `reg` | variable | 1 or vector | `always` / `initial` | Yes (as FF or combinational logic) |
| `integer` | variable | 32, signed | procedural blocks | Yes, as a 32-bit signal — but prefer sized vectors for ports and state |
| `real` | variable | 64-bit float | procedural blocks | No |
| `time` | variable | 64-bit unsigned | `$time` and procedural blocks | No |
| `parameter` / `localparam` | constant | any | at declaration | Yes (elaboration constant) |
| `genvar` | generate index | — | `generate` loops | Yes (elaboration only) |
| `string` | variable | — | procedural blocks | No |

`integer` is the right type for a loop counter inside `always` or for testbench bookkeeping (as in 8.5). It is the wrong type for a port or for stored state — use a sized `reg [N-1:0]` there so the width is explicit.

### 9.14.5 Complete example

```verilog
module literal_demo;
     reg  [7:0]  a;
     reg  [3:0]  b;
     reg         c;
     reg  [15:0] d;
     reg  [31:0] e;

     initial begin
          a = 8'hA5;           // hex, 8 bits
          b = 4'b1010;         // binary, 4 bits
          c = 1'b1;            // single bit
          d = 16'd4660;        // decimal, 16 bits
          e = '0;              // fill literal (SystemVerilog)

          $display("a=%h b=%b c=%b d=%d e=%h", a, b, c, d, e);
          $finish;
     end
endmodule
```

**Expected output:**

```
a=a5 b=1010 c=1 d=4660 e=00000000
```

### 9.14.6 Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Unsized literal in RTL (`255`) | 32-bit signed value mixed into a narrow expression | Write the size: `8'd255` |
| Assuming based literals are signed | `4'hF + 1` gives `0`, not `16` | Use `4'shF` when signedness matters |
| `x` left in a design after reset | Simulation "works", silicon does not | Reset every register; check for multiple drivers |
| Using `integer` for stored state | 32-bit signal inferred, not the width you wanted | Declare `reg [N-1:0]` |
| Expecting `z` to synthesize | Synthesis errors or a spurious tri-state buffer | `z` belongs to testbenches and true tri-state buses |

---

## 9.15 Buses and scalars

A **scalar** is a single bit. A **vector** — a bus — is an ordered group of bits treated as one signal. Almost every non-trivial design is built from vectors.

### 9.15.1 Scalar vs vector

```verilog
wire       a;          // scalar: 1 bit
wire [7:0] b;          // vector: 8 bits, b[7] is the MSB
reg  [3:0] q;          // 4-bit register
input  [7:0] data_in;  // 8-bit input port (1995 style)
```

In Verilog‑1995 style, one range applies to every name in the declaration:

```verilog
input [7:0] a, b;      // BOTH a and b are 8 bits
```

### 9.15.2 Bit order — `[7:0]` vs `[0:7]`

Both are legal. What changes is **which index is the most significant bit**.

| Declaration | MSB | LSB | Usual choice |
|---|---|---|---|
| `[7:0]` | index 7 | index 0 | Most code; matches left-to-right reading |
| `[0:7]` | index 0 | index 7 | Occasionally used when the bus maps to a bit-field spec |

Mixing the two in one design is legal but guarantees confusion during review. Pick `[N-1:0]` and stay with it.

### 9.15.3 Selecting bits

| Form | Syntax | Meaning |
|---|---|---|
| Bit-select | `b[3]` | A single bit |
| Part-select | `b[7:4]` | A constant-width slice; both bounds must be constants |
| Indexed part-select (SystemVerilog) | `b[base +: 4]` | 4 bits starting at `base`, going up; `base` may be a variable |
| Indexed part-select, downward | `b[base -: 4]` | 4 bits starting at `base`, going down |

`+:` and `-:` are the only way to slice a vector with a **variable** starting position. A plain part-select like `b[i:i+3]` is illegal — both bounds must be constant.

### 9.15.4 Concatenation and replication

| Operator | Meaning | Example |
|---|---|---|
| `{a, b, c}` | Concatenate, left to right | `{4'hA, 4'h5}` → `8'hA5` |
| `{n{expr}}` | Replicate `expr` `n` times | `{4{1'b1}}` → `4'b1111` |
| Nested | Both combined | `{2{byte_a[3:0]}}` → 8 bits |

Concatenation is the standard way to **extend** a value without losing the carry:

```verilog
assign sum = {1'b0, a} + {1'b0, b};   // 9-bit add of two 8-bit operands
```

### 9.15.5 Width rules and silent truncation

| Situation | Result |
|---|---|
| RHS wider than LHS | **Silently truncated** to the LHS width — high bits lost |
| RHS narrower than LHS | Zero-extended (unsigned) or sign-extended (signed) |
| Operands of different widths in an expression | Widened to the widest operand first |
| Signed and unsigned mixed | The operation is performed **unsigned** |

```verilog
wire [7:0] big;
wire [3:0] small;

assign big   = 8'hFF;
assign small = big;            // becomes 4'hF — the top 4 bits are gone, no warning
```

This is one of the most common Verilog bugs. If a value must keep its high bits, extend explicitly with `{1'b0, x}` or use a wider intermediate.

### 9.15.6 Arrays and memories are not vectors

| Declaration | Meaning |
|---|---|
| `reg [7:0] vec;` | **One** 8-bit value |
| `reg [7:0] mem [0:255];` | **256** values, each 8 bits — a memory |

A memory must be indexed to be used: `mem[i]` is an 8-bit value, but `mem` on its own cannot appear in an expression. Memories are synthesizable as block RAM on FPGAs (with the right coding style) and as register files on ASICs.

### 9.15.7 Ports as buses

Ports follow the same rules as internal signals:

```verilog
module alu (a, b, op, y);

     input  [7:0] a, b;
     input  [1:0] op;
     output [7:0] y;

     assign y = (op == 2'b00) ? (a + b) :
                (op == 2'b01) ? (a - b) :
                (op == 2'b10) ? (a & b) :
                                (a | b);

endmodule
```

### 9.15.8 Complete examples

**Vector manipulation:**

```verilog
module vector_demo;
     reg  [7:0]  byte_a;
     reg  [3:0]  nibble;
     reg  [11:0] twelve;
     wire [7:0]  swapped;

     assign swapped = {byte_a[3:0], byte_a[7:4]};   // swap the two nibbles

     initial begin
          byte_a = 8'hA5;
          nibble = byte_a[3:0];        // part-select
          twelve = {byte_a, nibble};   // concatenation: 8 + 4 = 12 bits

          $display("byte_a=%h swapped=%h nibble=%h twelve=%h",
                    byte_a, swapped, nibble, twelve);
          $finish;
     end
endmodule
```

**Expected output:**

```
byte_a=a5 swapped=5a nibble=5 twelve=a55
```

**Memory:**

```verilog
module mem_demo;
     reg [7:0] mem [0:3];
     integer   i;

     initial begin
          for (i = 0; i < 4; i = i + 1)
               mem[i] = i * 8;

          for (i = 0; i < 4; i = i + 1)
               $display("mem[%0d] = %0d", i, mem[i]);

          $finish;
     end
endmodule
```

**Expected output:**

```
mem[0] = 0
mem[1] = 8
mem[2] = 16
mem[3] = 24
```

### 9.15.9 Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Assuming `[0:7]` means the same as `[7:0]` | MSB and LSB reversed | Use `[N-1:0]` consistently |
| Variable part-select `b[i:i+3]` | Compile error | Use `b[i +: 4]` (SystemVerilog) |
| Assigning a wide value to a narrow one | Silent truncation | Extend explicitly, or widen the LHS |
| `mem` used without an index | Compile error | Index it: `mem[i]` |
| `input a, b;` then `input [7:0] b;` | Confusing mixed widths | Declare the whole group on one line: `input [7:0] a, b;` |
| Reading an out-of-range index | Returns `x` | Size the vector correctly; keep indices within range |

## 9.16 Key takeaways

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

11. **Number literals have a size, a base, and a signedness.** Write `8'd255`, not `255`. A plain decimal is signed 32-bit; a based number without a size is unsigned 32-bit.
12. **There are four signal values — `0`, `1`, `x`, `z`.** `x` means unknown or contention, `z` means high-impedance. Both are simulation concepts; `x` in a simulation is a bug, not a near-miss.
13. **A vector is a bus.** `wire [7:0] a;` is 8 bits with `a[7]` the MSB. Use bit-select `a[3]`, part-select `a[7:4]`, indexed part-select `a[i +: 4]`, and concatenation `{a, b}` to build and slice buses.
14. **Assignments silently truncate to the width of the left-hand side.** Extend explicitly with `{1'b0, a}`, and remember that `reg [7:0] vec;` is one 8-bit value while `reg [7:0] mem [0:255];` is 256 of them.
**Back to:** [Course home](index.html)
