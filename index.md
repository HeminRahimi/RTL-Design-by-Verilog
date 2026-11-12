---
layout: default
title: Home
---

# RTL Design with Verilog

A structured, tool-driven course on **Register-Transfer Level (RTL)** design using Verilog, written for students who want a professional workflow rather than a collection of disconnected snippets.

Every lesson is self-contained, every example is runnable, and the complete source for each design lives in the [`examples/`](examples/) folder of this repository.

---

## Course map

### Part I — Foundations

1. [Why RTL, different HDLs, and why Verilog?](01-why-rtl.html)
2. [Preferred tools: Icarus Verilog + GTKWave](02-tools.html)

### Part II — The four modeling levels

3. [The four modeling levels — overview](03-modeling-levels.html)
4. [**Switch level** — CMOS NOR (1 example)](04-switch-level.html)
5. [**Gate level** — NOR and full adder (2 examples)](05-gate-level.html)
6. [**Dataflow modeling** — half adder and 2:1 MUX (2 examples)](06-dataflow.html)
7. [**Behavioral modeling** — DFF with reset, 4:1 MUX, 4-bit up counter (3 examples)](07-behavioral.html)

### Part III — Verification (an independent topic, not a level)

8. [Verification with testbenches (2 testbenches)](08-verification.html)

---

## A note on terminology

Verilog is usually described as having **four levels of modeling**:

| # | Level | Constructs |
|---|---|---|
| 1 | Switch level | `nmos`, `pmos`, `cmos` |
| 2 | Gate level | `and`, `or`, `nor`, `not`, … |
| 3 | Dataflow | `assign` |
| 4 | Behavioral | `always`, `case`, `if` |

**Verification is not a modeling level.** It is a separate discipline that uses non-synthesizable constructs (`initial`, `$dumpfile`, `$dumpvars`, `$finish`, `#delay`) to check that a design — written at *any* of the four levels — behaves correctly. It is taught last because it depends on having a design to check, not because it is a fifth level of abstraction.

---

## What you need

- A computer running Windows, macOS, or Linux
- **Icarus Verilog** (`iverilog`, `vvp`)
- **GTKWave**
- A text editor (VS Code recommended)

Installation instructions are in [lesson 2](02-tools.html).
