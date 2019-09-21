

///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 2  Sample Code
//     Han-Wei Shen
//     9/16/2019 
//
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height; 

var LineVertexPositionBuffer;

var shape_counter = 0;     // shape size counter 

var colors = [];   // I am not doing colors, but you should :-) 
var shapes = [];   // the array to store what shapes are in the list
var shapes_tx=[];   // x translation  
var shapes_ty=[];   // y translation 
var shapes_rotation=[];  // rotation angle 
var shapes_scale=[];   // scaling factor (uniform is assumed)  

var polygon_mode = 'h';  //default = h line 
var color_mode  = 'r';

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    var canvas = document.getElementById("lab1-canvas");
    initGL(canvas);
    initShaders();
    ////////
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    ////////
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    initScene();
    
    document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);
}


//////////////////////////////////////////////////////////////////
///////               Create a Line VBO          /////////////////
function CreateBuffer() {
    var line_vertices = [         // A VBO for horizontal line in a standard position. To be translated to position of mouse click 
             -0.1, 0.0,  0.0,
	           0.1, 0.0,  0.0
        ];
    LineVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, LineVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line_vertices), gl.STATIC_DRAW);
    LineVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    LineVertexPositionBuffer.numItems = 2;// this buffer only contains A line, so only two vertices 
}

///////////////////////////////////////////////////////
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


///////////////////////////////////////////////////////
var mvMatrix = mat4.create();   // this is the matrix for transforming each shape before draw 

function draw_lines() {   // lab1 sample - draw lines only 
    gl.bindBuffer(gl.ARRAY_BUFFER, LineVertexPositionBuffer);    // make the line current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, LineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    for (var i=0; i<shape_counter; i++){  // draw the line vbo buffer multiple times, one with a new transformation specified by mouse click 
      	mat4.identity(mvMatrix);
      	var trans = [0,0,0];
      	trans[0] = shapes_tx[i]; 
      	trans[1] = shapes_ty[i];
      	trans[2] = 0.0; 
      	mvMatrix = mat4.translate(mvMatrix, trans);  // move from origin to mouse click 
      	mvMatrix = mat4.rotate(mvMatrix, degToRad(shapes_rotation[i]), [0, 0, 1]);  // rotate if any 
      	var scale = [1,1,1];
      	scale[0] = scale[1] = scale[2] = shapes_scale[i]; 
      	mvMatrix = mat4.scale(mvMatrix, scale);  // scale if any 
      	
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix); 
      	gl.drawArrays(gl.LINES, 0, LineVertexPositionBuffer.numItems);
    }
}

///////////////////////////////////////////////////////////////////////
// this is the function that you create all shape VBOs to be drawn later 
function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    CreateBuffer(); 
}

///////////////////////////////////////////////////////////////////////
// my sample code only draw lines but you should draw all other shapes 
function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw_lines();
    }


///////////////////////////////////////////////////////////////
//   Below are mouse and key event handlers 
//

var Z_angle = 0.0;
var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////

     function onDocumentMouseDown( event ) {
         event.preventDefault();
         document.addEventListener( 'mousemove', onDocumentMouseMove, false );
         document.addEventListener( 'mouseup', onDocumentMouseUp, false );
         document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	       var mouseX = event.clientX;
         var mouseY = event.ClientY; 
	 
         lastMouseX = mouseX;
         lastMouseY = mouseY;
	 
	 
      	 var NDC_X = (event.clientX - vp_minX)/vp_width*2 -1; 
      	 var NDC_Y = ((vp_height-event.clientY) - vp_minY)/vp_height*2 - 1 ;
      	 console.log("NDC click", event.clientX, event.clientY, NDC_X, NDC_Y);

      	 shapes.push(polygon_mode);
      	 colors.push(color_mode);
      	 shapes_tx.push(NDC_X); shapes_ty.push(NDC_Y); shapes_rotation.push(0.0); shapes_scale.push(1.0);
      	 
      	 Z_angle = 0.0;
      	 shape_counter++;

      	 console.log("size=", shape_counter);
      	 console.log("shape = ", polygon_mode);
	 
         drawScene();	 // draw the VBO 
      }


////////////////////////////////////////////////////////////////////////////////////
//
//   Mouse button handlers 
//
     function onDocumentMouseMove( event ) {  //update the rotation angle 
	 var mouseX = event.clientX;
         var mouseY = event.ClientY; 

         var diffX = mouseX - lastMouseX;
         var diffY = mouseY - lastMouseY;

         Z_angle = Z_angle + diffX/5;
	 
         lastMouseX = mouseX;
         lastMouseY = mouseY;
	 shapes_rotation[shape_counter-1] = Z_angle;   // update the rotation angle 

	 drawScene();	 // draw the VBO 
     }
     function onDocumentMouseUp( event ) {
         document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
         document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
         document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
     }

     function onDocumentMouseOut( event ) {
          document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
          document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
          document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
     }


///////////////////////////////////////////////////////////////////////////
//
//  key stroke handler 
//
    function onKeyDown(event) {
      console.log(event.keyCode);
      switch(event.keyCode)  {
         case 72:
              if (event.shiftKey) {
                  console.log('enter H');
		  polygon_mode = 'h' 
              }
              else {
		  console.log('enter h');
		  polygon_mode = 'h' 		  
              }
          break;
         case 86:
              if (event.shiftKey) {
                  console.log('enter V');
		  polygon_mode = 'v' 			  	  
              }
              else {
		  console.log('enter v');
		  polygon_mode = 'v' 				  
              }
          break;
         case 82:
              if (event.shiftKey) {
                  console.log('enter R');
		  color_mode = 'r' 			  	  
              }
              else {
		  console.log('enter r');
		  color_mode = 'r' 				  
              }
          break;
         case 71:
              if (event.shiftKey) {
                  console.log('enter G');
		  color_mode = 'g' 			  	  
              }
              else {
		  console.log('enter g');
		  color_mode = 'g' 				  
              }
          break;
         case 66:
              if (event.shiftKey) {
                  console.log('enter B');
		  color_mode = 'b' 			  	  
              }
              else {
		  console.log('enter b');
		  color_mode = 'b' 				  
              }
          break;
          case 83:
              if (event.shiftKey) {
                  console.log('enter S');
		  shapes_scale[shape_counter-1]*=1.1; 			  	  
              }
              else {
		  console.log('enter s');
		  shapes_scale[shape_counter-1]*=0.9; 			  	  		  
              }
          break;
	  
      }
	console.log('polygon mode =', polygon_mode);
	console.log('color mode =', color_mode);

	drawScene();	 // draw the VBO 
    }

