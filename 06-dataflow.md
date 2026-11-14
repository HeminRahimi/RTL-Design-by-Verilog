---
title: "6. Dataflow Modeling"
---

# 6. Dataflow modeling

## 6.1 The idea

Dataflow modeling describes a circuit with **continuous assignments**:

```verilog
assign lhs = rhs_expression;
```

The `assign` statement is *continuous*: whenever any signal on the right-hand side changes, the left-hand side is re-evaluated **immediately** (in zero simulation time). There is no "execution order" — all `assign` statements in a module are concurrent.

Dataflow is the natural level for **combinational logic**: you write the Boolean equation and you are done.

## 6.2 Rules for `assign`

| Rule | Explanation |
|---|---|
| The left side must be a **`wire`** (or an output declared as a wire) | `assign` cannot drive a `reg` |
| The left side can be a bit-select, part-select, or concatenation | `assign {cout, sum} = a + b + cin;` |
| Multiple `assign` statements are concurrent | Order in the file is irrelevant |
| A net must have **exactly one** driver | Two `assign`s to one wire = contention (`x`) |
| The right side may use any operator and any number of signals | It is an expression, not a statement |
| Assignments are evaluated in zero time | No delay unless you write `assign #5 y = a & b;` (not synthesizable) |

## 6.3 Operator reference

### Arithmetic

| Operator | Meaning |
|---|---|
| `+` `-` `*` | Add, subtract, multiply |
| `/` `%` | Divide, modulo (synthesizable only for powers of two or with an IP core) |
| `**` | Power (only constant exponents synthesize well) |

### Bitwise (operate bit-by-bit, no carry)

| Operator | Meaning |
|---|---|
| `&` | AND |
| `\|` | OR |
| `^` | XOR |
| `~^` or `^~` | XNOR |
| `~` | NOT (unary) |

### Logical (produce a single bit)

| Operator | Meaning |
|---|---|
| `&&` | Logical AND |
| `\|\|` | Logical OR |
| `!` | Logical NOT |

> **Critical distinction:** `&` is bitwise, `&&` is logical. For a 4-bit `a` and `b`, `a & b` is 4 bits; `a && b` is 1 bit (true if both are non-zero).

### Relational and equality

| Operator | Meaning |
|---|---|
| `==` `!=` | Logical equality (x if any bit is x or z) |
| `===` `!==` | Case equality (compares x and z literally) — **simulation only** |
| `<` `<=` `>` `>=` | Comparison |

### Shift

| Operator | Meaning |
|---|---|
| `<<` `>>` | Logical shift left / right |
| `<<<` `>>>` | Arithmetic shift (sign-preserving) |

### Conditional

```verilog
assign y = sel ? b : a;      // 2:1 multiplexer
```

The conditional operator is the idiomatic dataflow multiplexer.

### Concatenation and replication

| Operator | Meaning |
|---|---|
| `{a, b, c}` | Concatenate |
| `{4{a}}` | Replicate `a` four times |
| `{a[3:0], 4'b0000}` | Combine a part-select with a constant |

### Reduction (unary, produce one bit)

| Operator | Meaning |
|---|---|
| `&a` | AND-reduce all bits |
| `\|a` | OR-reduce |
| `^a` | XOR-reduce (parity) |

Reduction operators are how you write "are all bits high?" in one line.

## 6.4 Operator precedence (highest to lowest)

```text
()                          parentheses
!  ~  unary + -  reductions
**                          power
*  /  %                     multiply, divide, modulo
+  -                        add, subtract
<<  >>  <<<  >>>            shifts
<  <=  >  >=                relational
==  !=  ===  !==            equality
&                           bitwise AND
^  ~^                       bitwise XOR / XNOR
|                           bitwise OR
&&                          logical AND
||                          logical OR
?:                          conditional
```

**Advice:** parenthesise anything non-obvious. Readability beats saving three characters.

## 6.5 Example 1 — Half adder

```verilog
// examples/dataflow_half_adder.v
module half_adder (a, b, sum, carry);

     input  a, b;
     output sum, carry;

     assign sum   = a ^ b;
     assign carry = a & b;

endmodule
```

**Truth table:**

| a | b | sum | carry |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

Both assignments are concurrent. Whether `sum` or `carry` is written first makes no difference to the hardware.

## 6.6 Example 2 — 2:1 multiplexer

```verilog
// examples/dataflow_mux2.v
module mux2 (a, b, sel, y);

     input  a, b, sel;
     output y;

     assign y = sel ? b : a;

endmodule
```

**Truth table:**

| sel | y |
|---|---|
| 0 | a |
| 1 | b |

The conditional operator maps directly onto a 2:1 mux, and synthesis produces exactly that.

## 6.7 A richer example — 4-bit adder with carry out

```verilog
module add4 (a, b, cin, sum, cout);

     input  [3:0] a, b;
     input        cin;
     output [3:0] sum;
     output       cout;

     wire [4:0] tmp;

     assign tmp  = {1'b0, a} + {1'b0, b} + cin;
     assign sum  = tmp[3:0];
     assign cout = tmp[4];

endmodule
```

Note the **width extension**: `{1'b0, a}` makes `a` five bits wide so the carry is not lost. Silent truncation is one of the most common Verilog bugs.

## 6.8 Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Assigning to a `reg` | Compile error | Left side of `assign` must be a `wire` |
| Two `assign`s driving one net | `x` in simulation | One driver per net |
| Width mismatch | Silent truncation | Use `{1'b0, a}` or explicit part-selects |
| Using `==` to compare a signal containing `x` | Result is `x`, not 0/1 | Use `===` only in testbenches |
| Confusing `&` and `&&` | Wrong width or wrong logic | Bitwise for data, logical for conditions |
| `assign #5` in synthesizable code | Ignored by synthesis | Delays belong in testbenches only |

## 6.9 Synthesis view

Every `assign` becomes a combinational cloud of gates between its inputs and its output. Synthesis will:

- Optimise the Boolean function (constant folding, algebraic simplification, sharing),
- Map it to the target library's cells,
- Report the resulting area, delay, and power.

Because the tool does the optimisation, write the equation in the **clearest** form, not the "cleverest" one.

## 6.10 Key takeaways

1. `assign` = continuous, concurrent, combinational.
2. Left side must be a `wire`.
3. The conditional operator `?:` is the dataflow multiplexer.
4. Watch widths — Verilog truncates silently.
5. Dataflow is the right level for combinational logic.

**Next:** [Behavioral modeling →](07-behavioral.html)
