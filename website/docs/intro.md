---
title: Home
slug: /
---

# RTL Design with Verilog

A structured course on **Register-Transfer Level (RTL)** design using Verilog, covering the four modeling levels (switch, gate, dataflow, behavioral) followed by verification with testbenches.

## Purpose and audience

These notes were prepared as a basic, self-contained explanation of RTL design for students (at UoK) who are about to take, or are currently taking, related courses such as:

- **Computer Architecture**
- **Digital Systems Design**
- **VLSI Design**
- **FPGA-based System Design**
- **Digital Systems I Lab**

Rather than replacing those courses, these notes serve as an essential pillar for them. Mastering Verilog is crucial for completing course projects and gaining a much deeper understanding of complex digital structures through hands-on simulation.

> **Important Note:** If you are taking **Computer Architecture** or **Digital Systems Design** with me, following this Verilog course is **essential and necessary**. You will need the HDL and simulation skills taught here to follow the lectures, complete your projects, and succeed in the course.

## Contents

| # | Lesson |
|---|---|
| 1 | Why RTL, HDLs, and Verilog |
| 2 | Tools: Icarus Verilog + GTKWave |
| 3 | The four modeling levels |
| 4 | Switch level — CMOS NAND |
| 5 | Gate level — NAND, full adder |
| 6 | Dataflow — half adder, 2:1 MUX |
| 7 | Behavioral — DFF, 4:1 MUX, counter |
| 8 | Verification — testbenches |
| 9 | Essential Verilog concepts — including value types, numbers, buses, scalars |

All runnable examples are in [`examples/`](/examples/).

## Simulating

```bash
iverilog -g2012 -Wall -o sim examples/tb_mux4.v examples/behavioral_mux4.v
vvp sim
```

## License

Course materials are provided for educational use. Prepared by the instructor for classroom use.
