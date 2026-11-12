// Gate-level 2-input NAND using the built-in `nand` primitive.
// Primitive port order: (output, inputs...)
module gate_nand (a, b, y);

     input  a, b;
     output y;

     nand g1 (y, a, b);

endmodule
