module tb_mux4;

     reg  [1:0] sel;
     reg  [3:0] in;
     wire       out;

     mux4to1 uut (
          .sel (sel),
          .in  (in),
          .out (out)
     );

     integer s;

     initial begin
          $dumpfile("tb_mux4.vcd");
          $dumpvars(0, tb_mux4);

          in = 4'b1010;

          for (s = 0; s < 4; s = s + 1) begin
               sel = s;
               #10;
               $display("sel=%b  in=%b  out=%b  expected=%b", sel, in, out, in[s]);
               if (out !== in[s])
                    $display("   *** MISMATCH ***");
          end

          $finish;
     end

endmodule
