module cmos_nor (a, b, y);

     input  a, b;
     output y;

     supply1 vdd;
     supply0 gnd;
     wire    mid;

     pmos p1 (y,   vdd, a);
     pmos p2 (y,   vdd, b);

     nmos n1 (y,   mid, a);
     nmos n2 (mid, gnd, b);

endmodule
