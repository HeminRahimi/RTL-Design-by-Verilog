module counter4 (clk, reset, q);

     input            clk, reset;
     output     [3:0] q;
     reg        [3:0] q;

     always @(posedge clk or posedge reset) begin
          if (reset)
               q <= 4'b0000;
          else
               q <= q + 4'd1;
     end

endmodule
