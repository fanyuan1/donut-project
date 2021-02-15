(function() {
    var _onload = function() {
      var pretag = document.getElementById('d');
      var canvastag = document.getElementById('canvasdonut');
      var squaretag = document.getElementById('canvassquare');
      var hearttag = document.getElementById('canvasheart');
    
      var tmr1 = undefined, tmr2 = undefined, tmr3 = undefined, tmr4 = undefined;
      var A=1, B=1;
    
      // This is copied, pasted, reformatted, and ported directly from my original
      // donut.c code
      var asciiframe=function() {
        var b=[];
        var z=[];
        A += 0.07;
        B += 0.03;
        var cA=Math.cos(A), sA=Math.sin(A),
            cB=Math.cos(B), sB=Math.sin(B);
        for(var k=0;k<1760;k++) {
          b[k]=k%80 == 79 ? "\n" : " ";
          z[k]=0;
        }
        for(var j=0;j<6.28;j+=0.07) { // j <=> theta
          var ct=Math.cos(j),st=Math.sin(j);
          for(i=0;i<6.28;i+=0.02) {   // i <=> phi
            var sp=Math.sin(i),cp=Math.cos(i),
                h=ct+2, // R1 + R2*cos(theta)
                D=1/(sp*h*sA+st*cA+5), // this is 1/z
                t=sp*h*cA-st*sA; // this is a clever factoring of some of the terms in x' and y'
    
            var x=0|(40+30*D*(cp*h*cB-t*sB)),
                y=0|(12+15*D*(cp*h*sB+t*cB)),
                o=x+80*y,
                N=0|(8*((st*sA-sp*ct*cA)*cB-sp*ct*sA-st*cA-cp*ct*sB));
            if(y<22 && y>=0 && x>=0 && x<79 && D>z[o])
            {
              z[o]=D;
              b[o]=".,-~:;=!*#$@"[N>0?N:0];
            }
          }
        }
        pretag.innerHTML = b.join("");
      };
    
      window.anim1 = function() {
        if(tmr1 === undefined) {
          tmr1 = setInterval(asciiframe, 50);
        } else {
          clearInterval(tmr1);
          tmr1 = undefined;
        }
      };
    
      // This is a reimplementation according to my math derivation on the page
      var R1 = 1;
      var R2 = 2;
      var K1 = 150;
      var K2 = 5;
      var A2 = 0;
      var B2 = 0;
      var canvasframe=function() {
        var ctx = canvastag.getContext('2d');
        ctx.fillStyle='#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
          A2 += 0.07;
          B2 += 0.03;

        // precompute cosines and sines of A, B, theta, phi, same as before
        var cA=Math.cos(A2), sA=Math.sin(A2),
            cB=Math.cos(B2), sB=Math.sin(B2);
        for(var j=0;j<6.28;j+=0.3) { // j <=> theta
          var ct=Math.cos(j),st=Math.sin(j); // cosine theta, sine theta
          for(i=0;i<6.28;i+=0.1) {   // i <=> phi
            var sp=Math.sin(i),cp=Math.cos(i); // cosine phi, sine phi
            var ox = R2 + R1*ct, // object x, y = (R2,0,0) + (R1 cos theta, R1 sin theta, 0)
                oy = R1*st;
    
            var x = ox*(cB*cp + sA*sB*sp) - oy*cA*sB; // final 3D x coordinate
            var y = ox*(sB*cp - sA*cB*sp) + oy*cA*cB; // final 3D y
            var ooz = 1/(K2 + cA*ox*sp + sA*oy); // one over z
            var xp=(150+K1*ooz*x); // x' = screen space coordinate, translated and scaled to fit our 320x240 canvas element
            var yp=(120-K1*ooz*y); // y' (it's negative here because in our output, positive y goes down but in our 3D space, positive y goes up)
            // luminance, scaled back to 0 to 1
            var L=0.7*(cp*ct*sB - cA*ct*sp - sA*st + cB*(cA*st - ct*sA*sp));
            if(L > 0) {
              ctx.fillStyle = 'rgba(255,255,255,'+L+')';
              ctx.fillRect(xp, yp, 1.5, 1.5);
            }
          }
        }
      }
    
    
      window.anim2 = function() {
        if(tmr2 === undefined) {
          tmr2 = setInterval(canvasframe, 50);
        } else {
          clearInterval(tmr2);
          tmr2 = undefined;
        }
      };


    // square implementation
    var square_len = 2; //square side length
    var square_R2 = 0; //square hollowness, not used for now
    var square_K1 = 150;
    var square_K2 = 5;
    var square_K3 = 5;
    var square_stepsize = 0.05;
    var A3 = 0;
    var B3 = 0;
    var squareframe=function() {
        var ctx = squaretag.getContext('2d');
        ctx.fillStyle='#ffffff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
        // if(tmr3 === undefined) { // only update A and B if the first animation isn't doing it already
        A3 += 0.07;
        B3 += 0.00;
        // }
        // precompute cosines and sines of A, B, theta, phi, same as before
        var cA=Math.cos(A3), sA=Math.sin(A3),
            cB=Math.cos(B3), sB=Math.sin(B3);

        var steps = Math.round(square_len/square_stepsize);
        var start = square_len/-2;
            
        for(var i=0;i<steps+1;i+=1) { // j
            for (var j=0;j<steps+1;j+=1) {
                for (var k=0;k<steps+1;k+=1) {
                    if(Math.max(i,j,k) == steps || Math.min(i,j,k) == 0) {
                    
                    var ox = start+i*square_stepsize;
                    var oy = start+j*square_stepsize;
                    var oz = start+k*square_stepsize;
                    var x = cB*ox+sB*(sA*oz-cA*oy);
                    var y = sB*ox+cB*(cA*oy-sA*oz);
                    // var ooz = 1/(square_K2 + sA*oy+cA*oz);
                    var z = square_K2 + sA*oy+cA*oz;

                    var xp=(150+square_K1*x/z);
                    var yp=(120-square_K1*y/z);

                    // if(i != 0 && i != steps) {ox = 0;}
                    // if(j != 0 && j != steps) {oy = 0;}
                    // if(k != 0 && k != steps) {oz = 0;}

                    // if(i==0){ox=-1;} else if (i==steps){ox=1;} else {ox=0;}
                    // if(j==0){oy=-1;} else if (j==steps){oy=1;} else {oy=0;}
                    // if(k==0){oz=-1;} else if (k==steps){oz=1;} else {oz=0;}

                    // var lx=-1, ly=1, lz=-1;
                    // var L=0.7*ox*(lx*cB-ly*cA*sB+lz*sA*sB)+oy*(lx*sB+ly*cA*cB-lz*sA*cB)+(oz)*(ly*sA+lz*cA);

                    var L=1;
                    // if(k==steps) { //back face red
                    //   //console.log(xp,yp,L);
                    //   ctx.fillStyle = 'rgba(255,0,0,'+L+')';
                    //   ctx.fillRect(xp, yp, 1.5, 1.5);
                    // continue;}

                    // if(k==0) { //front face yellow
                    //   //console.log(xp,yp,L);
                    //   ctx.fillStyle = 'rgba(255,255,0,'+L+')';
                    //   ctx.fillRect(xp, yp, 1.5, 1.5);
                    // continue;}

                    if(i==steps) { //right face green
                      //console.log(xp,yp,L);
                      ctx.fillStyle = 'rgba(50,168,82,'+L+')';
                      ctx.fillRect(xp, yp, 1.5, 1.5);
                    continue;}

                    if(i==0) { //left face magenta
                      //console.log(xp,yp,L);
                      ctx.fillStyle = 'rgba(168,50,164,'+L+')';
                      ctx.fillRect(xp, yp, 1.5, 1.5);
                    continue;}

                    if(j==steps) { //top face blue
                      //console.log(xp,yp,L);
                      // {
                      //   ctx.fillStyle = 'rgba(70,79,184,'+L+')';
                      //   ctx.fillRect(xp, yp, 1.5, 1.5);
                      //   }
                      if(ox>=0) {
                      ctx.fillStyle = 'rgba(70,79,184,'+L+')';
                      ctx.fillRect(xp, yp, 1.5, 1.5);
                      }
                      else {ctx.fillStyle = 'rgba(255,0,0,'+L+')';
                      ctx.fillRect(xp, yp, 1.5, 1.5);}
                    continue;}

                    // if(j==0) { //bottom face teal
                    //   //console.log(xp,yp,L);
                    //   ctx.fillStyle = 'rgba(128,222,216,'+L+')';
                    //   ctx.fillRect(xp, yp, 1.5, 1.5);
                    // continue;}

                    // if(L > 0) {
                    //     // if (start+i*square_stepsize > 0)
                    //     // {ctx.fillStyle = 'rgba(255,255,255,'+L+')';
                    //     // ctx.fillRect(xp, yp, 1.5, 1.5);}
                    //     // else 
                    //     // if (start+k*square_stepsize > 0)
                    //     // {ctx.fillStyle = 'rgba(255,0,0,'+L+')'
                    //     // ctx.fillRect(xp, yp, 1.5, 1.5);}
                    //     // else if (start+k*square_stepsize <= 0)
                    //     // {ctx.fillStyle = 'rgba(0,255,0,'+L+')'
                    //     // ctx.fillRect(xp, yp, 1.5, 1.5);}
                    //     // else {ctx.fillStyle = 'rgba(255,0,0,'+L+')';
                    //     // ctx.fillRect(xp, yp, 1.5, 1.5);}
                    //     ctx.fillStyle = 'rgba(255,255,255,'+L+')';
                    //     ctx.fillRect(xp, yp, 1.5, 1.5);
                    // }
                  }
                }
            }
        }
    }
    
    window.anim3 = function() {
      if(tmr3 === undefined) {
        tmr3 = setInterval(squareframe, 50);
      } else {
        clearInterval(tmr3);
        tmr3 = undefined;
      }
    };


      // heart implementation

      // var heart_x_range = 4;
      // var heart_stepsize = 0.05;
      // var steps = Math.round(heart_x_range/heart_stepsize);
      // var start = heart_x_range/-2;
      var heart_K1 = 1000;
      var heart_K2 = 5;
      

      var A = 0;
      var B = 0;
      var C = 0;

      //light vector
      var lightx = 0;
      var lighty = 1;
      var lightz = -1;
      var lightnormalize = 1/Math.sqrt(lightx**2+lighty**2+lightz**0);
      var shading = ".,-~:;=!*#$@";

      var heartframe=function() {
          var ctx = hearttag.getContext('2d');
          ctx.fillStyle='#000';
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

          //rotation
          A += 0.00;
          B += 0.03;
          C += 0.03;
          // precompute cosines and sines of A, B, theta, phi, same as before
          var cA=Math.cos(A), sA=Math.sin(A),
              cB=Math.cos(B), sB=Math.sin(B)
              cC=Math.cos(C), sC=Math.sin(C);

          var x11 = cB*cC;
          var x21 = -cA*sB*cC+sA*sC;
          var x31 = sA*sA*cC+cA*sC;
          var x12 = sB;
          var x22 = cA*cB;
          var x32 = -sA*cB;
          var x13 = -cB*sC;
          var x23 = cA*sB*sC+sA*cC;
          var x33 = -sA*sC*cA*cC;

          
          for(var z=0;z<0.7;z+=0.05) {
            for(var x=0;x<1.2;x+=0.05) {
            //debugging
            // var x = 0.5;
            // var tmp_z = z;
            // var z = 0.25;
            var coeff4 = 3*x**2+27/4*z**2-3;
            var coeff3 = -1*(x**2-9/80*z**2);
            var coeff2 = 3*x**4+27/2*x**2*z**2-6*x**2+243/16*z**4-27/2*z**2+3;
            var coeff1 = x**6+27/4*x**4*z**2-3*x**4+243/16*x**2*z**4-27/2*x**2*z**2+3*x**2+729/64*z**6-243*z**4/16+27*z**2/4-1;
            
            var y_list = [-0.75,0.75]; // initial guess

              for (var y of y_list) {
                var new_guess = y;
                for(var c=0;c<20;c+=1) {
                  y = new_guess;
                  var diff = (y**6+coeff4*y**4+coeff3*y**3+coeff2*y**2+coeff1)/(6*y**5+4*coeff4*y**3+3*coeff3*y**2+2*coeff2*y);
                  if (Math.abs(diff) < 0.1**12) {
                    for (var k of [z,-z]) {
                      for (var i of [x,-x]) {
                  
                        var ox = i*x11+y*x21+k*x31;
                        var oy = i*x12+y*x22+k*x32;
                        var tmp_i = i*x13+y*x23+k*x33;
                        var ooi = 1/(heart_K2 + tmp_i);
                        var xp=(300+heart_K1*ox*ooi);
                        var yp=(240-heart_K1*oy*ooi);

                        //  shading
                        var dx = 6*i*(i**2+y**2+9/4*k**2-1)**2-2*i*y**3;
                        var dy = 6*y*(i**2+y**2+9/4*k**2-1)**2-3*i**2*y**2-27/80*y**2*k**2;
                        var dz = 9/40*k*(60*(i**2+y**2+9/4*k**2-1)**2-y**3);
                        var sx = dx*x11+dy*x21+dz*x31;
                        var sy = dx*x12+dy*x22+dz*x32;
                        var sz = dx*x13+dy*x23+dz*x33;

                        var normalize = 1/Math.sqrt(sx**2+sy**2+sz**2);
                        sx = sx*normalize;
                        sy = sy*normalize;
                        sz = sz*normalize;

                        var L=(lightx*sx+lighty*sy+lightz*sz)*lightnormalize;
                        
                        // var L=1;

                        if (L>0) {
                        // //JS lighting
                        ctx.fillStyle = 'rgba(255,255,255,'+L+')';
                        ctx.fillRect(xp, yp, 3, 3);

                        // // ASCII
                        // ctx.fillStyle = 'rgba(255,255,255)';
                        // ctx.fillText(shading[Math.round(L/0.09090909)],xp, yp,20);
                        }
                      }
                    }
                    break;
                    }
                  new_guess = y - diff;
              }
            }
            // z = tmp_z;
          }
        }


            
          

      // }
    }
      
      window.anim4 = function() {
          if(tmr4 === undefined) {
          tmr4 = setInterval(heartframe, 50);
          } 
          else {
          clearInterval(tmr4);
          tmr4 = undefined;
          }
      };
    
      asciiframe();
      canvasframe();
      squareframe();
      heartframe();
      
    }
    
    if(document.all)
      window.attachEvent('onload',_onload);
    else
      window.addEventListener("load",_onload,false);
    })();


// previous heart code
    // for(var i=0;i<steps+1;i+=1) {
    //   var x = start+i*heart_stepsize;
    //   var y1 = Math.sqrt(heart_width/4-(Math.abs(x)-heart_width/4)**2);
    //   var y2 = -1*heart_length*Math.sqrt(1-Math.sqrt(Math.abs(x)/(heart_width/2)));
    //   var z = heart_K2;

      // x=(150+heart_K1*x/z);
      // y1=(120-heart_K1*y1/z);
      // y2=(120-heart_K1*y2/z);

      // var L = 1;
      // if(L > 0) {
      //   ctx.fillStyle = 'rgba(255,0,0,'+L+')';
      //   ctx.fillRect(x, y1, 1.5, 1.5);
      //   ctx.fillRect(x, y2, 1.5, 1.5);