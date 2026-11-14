---
layout: default
title: "3. The Four Modeling Levels"
---

# 3. The four modeling levels

Verilog lets you describe the same circuit at four different levels of abstraction. Each level trades **control** for **conciseness**.

| # | Level | Verilog construct | What you describe | Synthesizable |
|---|---|---|---|---|
| 1 | **Switch level** | `nmos`, `pmos`, `cmos` | Individual transistors | Yes |
| 2 | **Gate level** | `and`, `or`, `nor`, `not`, `nand`, `xor`, … | Logic gates | Yes |
| 3 | **Dataflow** | `assign` | Boolean equations on nets | Yes |
| 4 | **Behavioral** | `always`, `case`, `if`, `for` | Algorithmic behaviour | Yes (with care) |

## 3.1 The running example

The same **2-input NAND gate** is written at all four levels throughout this course, so you can compare them directly.

| a | b | y = ¬(a ∧ b) |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

- **Switch level:** two PMOS in parallel (pull-up), two NMOS in series (pull-down).
- **Gate level:** one `nand` primitive.
- **Dataflow:** `assign y = ~(a & b);`
- **Behavioral:** an `always @(*)` block with an `if`/`case`.

## 3.2 How the levels relate

```text
Switch level      ← transistors
     ↓  (abstraction)
Gate level        ← gates
     ↓
Dataflow          ← equations
     ↓
Behavioral        ← algorithms
```

- Moving **down** the list gives you more explicit control over the final hardware.
- Moving **up** gives you more compact, more portable, more readable code.
- Modern RTL is written almost entirely at the **dataflow** and **behavioral** levels; switch and gate levels are used for teaching, for cell libraries, and for final sign-off.


## 3.3 Design vs. verification: one table

| | Design (levels 1–4) | Verification (lesson 8) |
|---|---|---|
| Purpose | Describe the circuit | Check the circuit |
| Constructs | `assign`, `always`, primitives | `initial`, `#delay`, `$display`, `$dumpfile` |
| Synthesizable | Yes | No |
| Ends up in silicon | Yes | Never |
| Example | `behavioral_dff.v` | `tb_dff.v` |

## 3.4 Which level should you use?

| Situation | Level |
|---|---|
| Learning how transistors make a gate | Switch |
| Writing a standard-cell library model | Switch / gate |
| Small combinational logic, direct equations | Dataflow |
| Anything sequential, FSMs, arithmetic, memories | Behavioral |
| Checking that any of the above works | Verification |

A practical rule: **write combinational logic as dataflow, sequential logic as behavioral.**

**Next:** [Switch-level modeling →](04-switch-level.html)
