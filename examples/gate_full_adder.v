module gate_full_adder (a, b, cin, sum, carry);

     input  a, b, cin;
     output sum, carry;

     wire s1, c1, c2;

     xor g1 (s1, a, b);
     xor g2 (sum, s1, cin);
     and g3 (c1, a, b);
     and g4 (c2, s1, cin);
     or  g5 (carry, c1, c2);

endmodule
