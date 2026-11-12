---
layout: default
title: "1. Why RTL, HDLs, and Verilog?"
---

# 1. Why RTL, different HDLs, and why Verilog?

## 1.1 The digital design flow

A modern digital chip is produced through a chain of transformations:

```text
specification → RTL → synthesis → gate-level netlist → place & route → GDSII → silicon
```

Each arrow is performed by an EDA tool. The **first** arrow — specification to RTL — is the one a human writes. Everything downstream is automated.

This is why RTL is the single most important skill in digital design: it is the *only* hand-written artifact in the flow, and every later stage inherits its correctness (or its bugs).

## 1.2 What "RTL" actually means

**Register-Transfer Level** describes a circuit as:

- **Registers** (flip-flops) that hold state, and
- **Combinational logic** that computes the next value of each register from the current state and the inputs.

The name is literal: data is *transferred* from register to register through combinational logic, once per clock edge.

> **Note:** In this course "RTL" means **Register-Transfer Level**.

An RTL description is **synthesizable**: a synthesis tool can convert it into gates. This property separates RTL from testbench code, which is not synthesizable.

## 1.3 Why not design directly at gate level?

| Aspect | Gate level | RTL |
|---|---|---|
| Lines of code for a 32-bit adder | ~160 gate instances | 1 line: `assign s = a + b;` |
| Portability | Tied to a specific cell library | Technology-independent |
| Simulation speed | Slow | Fast |
| Human review | Very difficult | Readable |
| Optimization | Manual | Automatic (tool explores the design space) |

Gate-level design is still used for final sign-off and for library characterization, but no modern design is *created* at gate level.

## 1.4 The three mainstream HDLs

| Language | Standard | Character | Typical use |
|---|---|---|---|
| **VHDL** | IEEE 1076 | Strongly typed, verbose, Ada-like | European industry, aerospace, defense, FPGA |
| **Verilog** | IEEE 1364 | Concise, C-like | ASIC and FPGA RTL; industry standard |
| **SystemVerilog** | IEEE 1800 | Verilog + classes, assertions, constrained-random, interfaces | Modern RTL *and* verification |

**History in one paragraph.** Verilog was created by Gateway Design Automation in 1984, standardised as IEEE 1364‑1995, extended in 1364‑2001 (generate blocks, `always @*`, signed arithmetic) and 1364‑2005 (`uwire`, `$clog2`). SystemVerilog (1800‑2005, 1800‑2012, 1800‑2017) is a superset: every legal Verilog design is legal SystemVerilog. In practice, "Verilog" today usually means "the Verilog subset of SystemVerilog".

## 1.5 Why this course uses Verilog

1. **Industry adoption.** Verilog/SystemVerilog is the dominant HDL in ASIC and FPGA RTL.
2. **Conciseness.** `assign y = a & b;` is easier to read than the VHDL equivalent.
3. **Free, complete toolchain.** Icarus Verilog + GTKWave give you compile, simulate, and waveform viewing at zero cost on every OS.
4. **Direct upgrade path.** Everything you learn transfers to SystemVerilog, which is the verification language of industry.
5. **Huge corpus of open IP.** OpenCores, PULP, and most academic cores are in Verilog.

## 1.6 Verilog is not a programming language

This is the most common beginner trap. Verilog *looks* like C but describes **hardware**, which is concurrent.

| Software (C) | Hardware (Verilog) |
|---|---|
| Statements execute in order | All `assign` statements and all `always` blocks execute **in parallel** |
| Variables hold values over time | A `wire` has no memory; a `reg` in a clocked block becomes a flip-flop |
| A function is called when reached | A module describes a physical circuit that always exists |
| Loops iterate at runtime | `generate`/`for` unroll at elaboration; they create parallel hardware |

## 1.7 Vocabulary you will need

| Term | Meaning |
|---|---|
| **Module** | The basic building block; a circuit with ports. Analogous to a class. |
| **Port** | An input, output, or inout connection of a module. |
| **Net / `wire`** | A connection that must be continuously driven. No storage. |
| **Variable / `reg`** | A signal assigned inside a procedural block. Becomes a flip-flop if assigned in a clocked block. |
| **Instance** | A module used inside another module. |
| **Elaboration** | The step where parameters and `generate` blocks are resolved before simulation. |
| **Synthesis** | Translation of RTL into a gate-level netlist. |
| **Testbench** | A non-synthesizable module that drives a design and observes its outputs. |

## 1.8 What you should be able to do after this course

- Read and write synthesizable RTL at gate, dataflow, and behavioral levels.
- Choose the right level of abstraction for a given problem.
- Simulate any design with Icarus Verilog and inspect it in GTKWave.
- Write a testbench that applies stimulus and checks results.

**Next:** [Choose your tools →](02-tools.html)
