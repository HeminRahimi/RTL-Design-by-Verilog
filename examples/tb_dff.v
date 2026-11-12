module tb_dff;

     reg  clk, reset, d;
     wire q;

     dff uut (
          .clk   (clk),
          .reset (reset),
          .d     (d),
          .q     (q)
     );

     initial clk = 1'b0;
     always #5 clk = ~clk;

     initial begin
          $dumpfile("tb_dff.vcd");
          $dumpvars(0, tb_dff);

          reset = 1'b1; d = 1'b0;
          #12 reset = 1'b0; d = 1'b1;
          #10 d = 1'b0;
          #10 d = 1'b1;
          #10 d = 1'b0;
          #10 $finish;
     end

     initial begin
          $monitor("t=%0t  reset=%b  d=%b  q=%b", $time, reset, d, q);
     end

endmodule
