---
layout: default
title: "4. Switch-Level Modeling"
---

# 4. Switch-level modeling: CMOS NAND

## 4.1 Transistors as switches

At the switch level a circuit is a network of transistors connecting a supply rail (`VDD`, logic 1) to ground (`GND`, logic 0).

| Transistor | Turns ON when gate is | Conducts | Good at passing |
|---|---|---|---|
| **NMOS** | high (1) | 0 | strong 0, weak 1 |
| **PMOS** | low (0) | 1 | strong 1, weak 0 |

CMOS logic pairs them: a **pull-up network** of PMOS transistors connects the output to `VDD`, and a **pull-down network** of NMOS transistors connects it to `GND`. Exactly one network conducts at a time, so the output is always driven.

## 4.2 CMOS NAND structure

For `y = ¬(a ∧ b)`:

- **Pull-up:** output must be 1 whenever **at least one** input is 0 → two PMOS in **parallel**.
- **Pull-down:** output must be 0 only when **both** inputs are 1 → two NMOS in **series**.

```text
        VDD
         │
    ┌────┴────┐
   ▷│ p1     ▷│ p2        PMOS in parallel  (gate = a, b)
    └────┬────┘
         │
         y ────────────
         │
        ─┴─ n1  (gate = a)   NMOS
         │
        ─┴─ n2  (gate = b)   NMOS
         │
        GND
```

## 4.3 Verilog switch-level primitives

```verilog
nmos  [instance_name] (drain, source, gate);
pmos  [instance_name] (drain, source, gate);
cmos  [instance_name] (drain, source, ngate, pgate);
```

- `nmos` / `pmos` take **drain, source, gate** in that order.
- `supply1` and `supply0` are the constant 1 and 0 nets.
- Any connection point that is not a port must be declared as a `wire`.

## 4.4 Complete example

```verilog
// examples/switch_nand.v
module cmos_nand (a, b, y);

     input  a, b;
     output y;

     supply1 vdd;
     supply0 gnd;
     wire    mid;

     // Pull-up: PMOS in PARALLEL between VDD and y
     pmos p1 (y,   vdd, a);
     pmos p2 (y,   vdd, b);

     // Pull-down: NMOS in SERIES between y and GND
     nmos n1 (y,   mid, a);
     nmos n2 (mid, gnd, b);

endmodule
```

## 4.5 Truth table produced by this circuit

| a | b | p1 | p2 | n1 | n2 | y |
|---|---|---|---|---|---|---|
| 0 | 0 | ON | ON | off | off | **1** |
| 0 | 1 | ON | off | off | off | **1** |
| 1 | 0 | off | ON | off | off | **1** |
| 1 | 1 | off | off | ON | ON | **0** |

The output is low only when both inputs are high — a NAND gate, produced purely from transistors.

## 4.6 Simulating it

```bash
iverilog -g2012 -Wall -o sim_nand examples/switch_nand.v
vvp sim_nand
```

Because there is no testbench and no `$dumpfile`, `vvp` exits immediately without output. To observe the behaviour you need a testbench — which is the subject of lesson 8. This is exactly the point: **switch-level code describes the circuit, it does not exercise it.**

## 4.7 Where switch level is used in practice

- **Standard-cell library characterization.** Library vendors model each cell at transistor level for accurate delay and power.
- **Analog/mixed-signal.** SPICE is the real tool here; Verilog's switch primitives are only a coarse approximation.
- **Teaching.** Nothing builds intuition for CMOS like drawing the pull-up and pull-down networks.

## 4.8 Limitations

- **No timing.** Verilog switch primitives model ideal switches, not real transistor delay. For real timing you need SPICE or a characterized cell model.
- **No drive strength in practice.** The strength system exists but is rarely used in RTL.
- **Not portable to synthesis.** Synthesis tools do not accept switch-level Verilog. This is a modeling exercise, not a design entry point.

## 4.9 Key takeaways

1. CMOS logic is built from complementary pull-up (PMOS) and pull-down (NMOS) networks.
2. NAND = PMOS **parallel**, NMOS **series**.
3. `nmos`/`pmos` take `(drain, source, gate)`.
4. Switch level builds understanding; it is not how RTL is written.

**Next:** [Gate-level modeling →](05-gate-level.html)
