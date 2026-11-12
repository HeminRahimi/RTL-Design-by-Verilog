// Switch-level CMOS NAND gate.
// Pull-up: two PMOS in parallel.  Pull-down: two NMOS in series.
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
