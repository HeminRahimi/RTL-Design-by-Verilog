---
layout: default
title: "2. Tools: Icarus Verilog + GTKWave"
---

# 2. Preferred tools: Icarus Verilog + GTKWave

This course uses exactly two tools. Both are free, open source, and available on Windows, macOS, and Linux.

| Tool | Binary | Role |
|---|---|---|
| **Icarus Verilog** | `iverilog` | Compiles Verilog into an executable simulation |
| **Icarus Verilog runtime** | `vvp` | Runs the compiled simulation and writes the VCD waveform |
| **GTKWave** | `gtkwave` | Displays the VCD waveform graphically |

## 2.1 Why these tools

- **Zero cost, zero licence servers.** Students can work at home.
- **Standards-compliant.** Icarus Verilog supports Verilog‑2005 and most of SystemVerilog‑2012 (`-g2012`).
- **Fast enough.** A few thousand lines of RTL simulate in well under a second.
- **The workflow is the real industry workflow.** Compile → simulate → inspect waveform is exactly what you do with Vivado, Questa, or VCS; only the command names differ.
- **No GUI required.** Everything works over SSH and in CI (GitHub Actions).

## 2.2 Installation

### Ubuntu / Debian / WSL

```bash
sudo apt update
sudo apt install iverilog gtkwave
```

### Fedora

```bash
sudo dnf install iverilog gtkwave
```

### macOS (Homebrew)

```bash
brew install icarus-verilog
brew install --cask gtkwave
```

### Windows

1. Download the installer from **bleyer.org/icarus** (the "Icarus Verilog for Windows" package).
2. Run it and **check the "GTKWave" component** during installation.
3. Ensure `C:\iverilog\bin` is on your `PATH`.
4. Open **Command Prompt** and verify:

```bat
iverilog -V
gtkwave --version
```

### Verify the installation

```bash
iverilog -V
vvp -V
gtkwave --version
```

All three must print a version banner. If `iverilog` is "not found", the `bin` directory is not on your `PATH`.

## 2.3 The three-step workflow

```bash
# Step 1 — compile design + testbench into a simulation binary
iverilog -o sim tb_dff.v behavioral_dff.v

# Step 2 — run the simulation (produces the .vcd waveform)
vvp sim

# Step 3 — view the waveform
gtkwave tb_dff.vcd
```

Notes on step 1:

- `-o sim` names the output file. Without it, the default is `a.out`.
- List **every** `.v` file that the design needs, **including the testbench**.
- Order does not matter; Icarus Verilog elaborates from the top module it finds.

Notes on step 2:

- The simulation writes `tb_dff.vcd` only because the testbench contains `$dumpfile` and `$dumpvars`.

Notes on step 3:

- GTKWave opens a GUI. Drag signals from the left panel into the waveform area.

## 2.4 Icarus Verilog command reference

| Option | Meaning |
|---|---|
| `-o <file>` | Output simulation binary name |
| `-g2012` | Enable SystemVerilog‑2012 features (recommended) |
| `-g2005` | Verilog‑2005 only |
| `-Wall` | Enable all warnings (use it) |
| `-s <module>` | Explicitly set the top module (needed when several candidates exist) |
| `-I <dir>` | Add an include directory |
| `-D<MACRO>` | Define a preprocessor macro |
| `-y <dir>` | Library directory for automatic module search |

A professional compile line for this course:

```bash
iverilog -g2012 -Wall -o sim tb_dff.v behavioral_dff.v
```

## 2.5 The waveform dump: `$dumpfile` and `$dumpvars`

```verilog
initial begin
    $dumpfile("tb_dff.vcd");   // file name
    $dumpvars(0, tb_dff);      // 0 = all levels of hierarchy, starting at tb_dff
end
```

- **VCD** = Value Change Dump, an ASCII format that GTKWave and every other waveform viewer can read.
- The `0` argument means "record every signal in the hierarchy below `tb_dff`". Use `1` to record only the top level.
- Call `$dumpvars` **once**, at time 0, at the start of the simulation.
- VCD files grow quickly. For long simulations, dump only the signals you need: `$dumpvars(1, tb_dff.uut)`.

## 2.6 Other useful system tasks

| Task | Effect |
|---|---|
| `$display(...)` | Print once, like `printf`, with a newline |
| `$write(...)` | Print without a newline |
| `$monitor(...)` | Print automatically whenever any listed signal changes |
| `$time` | Current simulation time |
| `$finish` | End the simulation |
| `$stop` | Break into the interactive debugger |
| `$random` | Pseudo-random integer (for stimulus) |

## 2.7 `timescale`

```verilog
`timescale 1ns/1ps
```

- The **first** value is the time unit for `#` delays.
- The **second** is the precision (rounding) of simulation time.
- Put it at the top of the **testbench** only. Design files should not carry delays.

## 2.8 A Makefile to automate the workflow

Save as `Makefile` in the repository root:

```make
IV   = iverilog
VVP  = vvp
GTK  = gtkwave
FLAGS = -g2012 -Wall

# Usage: make dff
dff:
	$(IV) $(FLAGS) -o sim_dff examples/tb_dff.v examples/behavioral_dff.v
	$(VVP) sim_dff
	$(GTK) tb_dff.vcd &

# Usage: make mux
mux:
	$(IV) $(FLAGS) -o sim_mux examples/tb_mux4.v examples/behavioral_mux4.v
	$(VVP) sim_mux
	$(GTK) tb_mux4.vcd &

clean:
	rm -f sim_* *.vcd
```

Run `make dff` and the whole compile‑simulate‑view chain executes.

## 2.9 Editor setup

**VS Code extensions:**

- *Verilog-HDL/SystemVerilog/Bluespec* — syntax highlighting, linting, ctags navigation.
- *WaveTrace* or *VaporView* — view VCD files inside the editor.

## 2.10 Alternatives you will meet later

| Tool | Why it exists | Note |
|---|---|---|
| **Verilator** | 10–100× faster; compiles Verilog to C++ | Strict subset, no `#delay` in synthesizable code |
| **EDA Playground** | Browser-based, no install | Good for quick experiments |
| **Vivado / Quartus** | Vendor synthesis + simulation | Heavy; needed only for FPGA implementation |
| **Questa / VCS / Xcelium** | Commercial simulators | Industry sign-off |

Everything in this course runs on Icarus Verilog. Nothing requires a commercial tool.

**Next:** [The four modeling levels →](03-modeling-levels.html)
