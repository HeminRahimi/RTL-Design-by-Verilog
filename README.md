# RTL Design with Verilog

A structured course on **Register-Transfer Level (RTL)** design using Verilog, covering the four modeling levels (switch, gate, dataflow, behavioral) followed by verification with testbenches.


## Purpose and audience

These notes were prepared as a basic, self-contained explanation of RTL design for students (at UoK) who are about to take, or are currently taking, related courses such as:

- **Computer Architecture**
- **Digital Systems Design**
- **VLSI Design**
- **FPGA-based System Design**
- **Digital Systems I Lab**

They do not replace those courses. They give the vocabulary, the toolchain, and the modeling mindset you need so that the first lecture of any of them does not feel like a foreign language. The goal is to remove the initial friction: after working through these eight lessons you should be able to open a Verilog file in any of those courses and understand what it is doing, why it is written that way, and how to simulate it.

> If you are taking **Computer Architecture**, these notes give you the RTL side of the picture; the architecture course gives you the organization side (pipelines, caches, ISA). If you are taking **Digital Systems Design**, they give you the HDL and simulation skills that the course assumes you already have.

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

All runnable examples are in [`examples/`](examples/).

## Simulating

```bash
iverilog -g2012 -Wall -o sim examples/tb_mux4.v examples/behavioral_mux4.v
vvp sim
```

## License

Course materials are provided for educational use. Prepared by the instructor for classroom use.
