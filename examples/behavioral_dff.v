module dff (clk, reset, d, q);

     input  clk, reset, d;
     output q;
     reg    q;

     always @(posedge clk or posedge reset) begin
          if (reset)
               q <= 1'b0;
          else
               q <= d;
     end

endmodule
