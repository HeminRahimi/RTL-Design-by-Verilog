---
layout: default
title: "5. Gate-Level Modeling"
---

# 5. Gate-level modeling

## 5.1 The idea

At gate level you instantiate **built-in primitives** — `and`, `or`, `nand`, `nor`, `xor`, `xnor`, `not`, `buf` — and connect them with wires. You are describing a netlist by hand.

## 5.2 Primitive syntax

```verilog
gate_type [instance_name] (output, input1, input2, ...);
```

**The output always comes first**, then the inputs. This is the opposite of most people's intuition and is the single most common gate-level bug.

For `not` and `buf` there is one input:

```verilog
not [instance_name] (output, input);
buf [instance_name] (output, input);
```

Several instances may share one line:

```verilog
nand g1 (y1, a, b),
     g2 (y2, c, d);
```

## 5.3 Complete primitive list

| Type | Inputs | Function |
|---|---|---|
| `and` | 2+ | `a & b & …` |
| `or` | 2+ | `a \| b \| …` |
| `nand` | 2+ | `~(a & b & …)` |
| `nor` | 2+ | `~(a \| b \| …)` |
| `xor` | 2+ | `a ^ b ^ …` |
| `xnor` | 2+ | `~(a ^ b ^ …)` |
| `not` | 1 | `~a` |
| `buf` | 1 | `a` |

## 5.4 Example 1 — 2-input NAND

```verilog
// examples/gate_nand.v
module gate_nand (a, b, y);

     input  a, b;
     output y;

     nand g1 (y, a, b);

endmodule
```

One instance named `g1`, output `y` first, inputs `a` and `b` after. This produces exactly the same circuit as the switch-level NAND of lesson 4.

**Truth table:**

| a | b | y |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

## 5.5 Example 2 — 1-bit full adder

A full adder sums three bits and produces `sum` and `carry`:

```text
sum   = a ⊕ b ⊕ cin
carry = (a · b) + ((a ⊕ b) · cin)
```

Building it from primitives requires intermediate wires:

```verilog
// examples/gate_full_adder.v
module gate_full_adder (a, b, cin, sum, carry);

     input  a, b, cin;
     output sum, carry;

     wire s1, c1, c2;

     xor g1 (s1, a, b);
     xor g2 (sum, s1, cin);
     and g3 (c1, a, b);
     and g4 (c2, s1, cin);
     or  g5 (carry, c1, c2);

endmodule
```

**Truth table:**

| cin | b | a | sum | carry |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

This example demonstrates the essential gate-level skill: **decomposing a Boolean expression into a netlist, declaring every intermediate signal as a `wire`, and connecting primitives in the right port order.**

## 5.6 Structural hierarchy

Gate-level modules can be instantiated inside other modules to build larger circuits. This is called **structural** or **hierarchical** modeling:

```verilog
// A 2-bit ripple-carry adder built from two full adders
module ripple_adder2 (a, b, cin, sum, cout);

     input  [1:0] a, b;
     input        cin;
     output [1:0] sum;
     output       cout;

     wire c1;

     gate_full_adder fa0 (.sum(sum[0]), .carry(c1),   .a(a[0]), .b(b[0]), .cin(cin));
     gate_full_adder fa1 (.sum(sum[1]), .carry(cout), .a(a[1]), .b(b[1]), .cin(c1));

endmodule
```

Named port connections (`.port(signal)`) are strongly preferred over positional ones: they are self-documenting and immune to port-order changes.

## 5.7 Common mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Inputs before output | Wrong netlist, silent error | Output comes **first** in gate primitives |
| Declaring the output as `reg` | Compile error | Gate outputs drive `wire` |
| Forgetting to declare an intermediate signal | Implicit 1-bit wire (a warning in `-Wall`) | Declare every `wire` explicitly |
| Leaving an output unconnected | Floating net | Connect every output |

Compile with `-Wall` — Icarus Verilog will flag undeclared nets.

## 5.8 When to use gate level

- **Teaching** Boolean decomposition and netlists.
- **Reading synthesis output.** Synthesis produces gate-level Verilog; you must be able to read it.
- **Small, timing-critical structures** where you want a specific gate arrangement.
- **Library models** (with timing annotations added).

For everything else, dataflow or behavioral is shorter, clearer, and lets the synthesis tool optimise.

## 5.9 Key takeaways

1. Gate primitives: `gate_type [name] (output, inputs...);` — **output first**.
2. Intermediate signals must be declared as `wire`.
3. Hierarchy is built by instantiating modules with named port connections.
4. Gate level shows you what synthesis produces; it is not how you write production RTL.

**Next:** [Dataflow modeling →](06-dataflow.html)
