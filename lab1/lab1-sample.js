///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 1  Sample Code
//     Han-Wei Shen
//
//     In this sample code I show you how to draw h and v lines from mouse clicks 
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height; 

var VertexPositionBuffer;

var shape_counter = 0;     // shape size counter 
var point_counter = 0;     // point size counter 

var vbo_vertices = [];  // i only store line vertices, 2 points per click 
var colors = [];   // I am not doing colors, but you should :-) 
var shapes = [];   // the array to store what shapes are in the list 

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
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    initScene();
    
    document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);
}


///////////////////////////////////////////////////////////
///////               Create VBO          /////////////////
function CreateBuffer() {
    VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_vertices), gl.STATIC_DRAW);
    VertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    VertexPositionBuffer.numItems = shape_counter*2;// this example only draw lines, so n*2 vertices 
}

///////////////////////////////////////////////////////
function draw_lines() {   // lab1 sample - draw lines only 
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, VertexPositionBuffer.numItems);
}

///////////////////////////////////////////////////////////////////////

function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // draw_lines();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, VertexPositionBuffer.numItems);
    }


///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////

  function onDocumentMouseDown( event ) {
    event.preventDefault();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mouseout', onDocumentMouseOut, false );

    var NDC_X = event.clientX;
    var NDC_Y = event.clientY;

    //get canvas' coordinate from the browser client area
    var rect = event.target.getBoundingClientRect();

    //tranform the coordinate from client area to canvas, then tranform to webgl
    NDC_X = ((NDC_X - rect.left) - vp_width/2) / (vp_width/2);
    NDC_Y = (vp_height/2 - (NDC_Y - rect.top)) / (vp_height/2);

	 // var NDC_X = (event.clientX - vp_minX)/vp_width*2 -1; 
	 // var NDC_Y = ((vp_height-event.clientY) - vp_minY)/vp_height*2 - 1;

	 console.log("NDC click", event.clientX, event.clientY, NDC_X, NDC_Y);

   if (polygon_mode == 'p'){        // add one point of p point
        vbo_vertices.push(NDC_X);
        vbo_vertices.push(NDC_Y);
        vbo_vertices.push(0.0);

        point_counter++;
   }
   if (polygon_mode == 'h' ) {       // add two points of h line
       vbo_vertices.push(NDC_X-0.1);
       vbo_vertices.push(NDC_Y);
       vbo_vertices.push(0.0);

       vbo_vertices.push(NDC_X+0.1);
       vbo_vertices.push(NDC_Y);
       vbo_vertices.push(0.0);

       point_counter += 2;
   }
   else if (polygon_mode == 'v' ) {  // add two end points of the v line 
       vbo_vertices.push(NDC_X);
       vbo_vertices.push(NDC_Y-0.1);
       vbo_vertices.push(0.0);

       vbo_vertices.push(NDC_X);
       vbo_vertices.push(NDC_Y+0.1);
       vbo_vertices.push(0.0);

       point_counter += 2;
   } 
	 
	 shapes.push(polygon_mode);
	 colors.push(color_mode); 
	 shape_counter++; 
	 console.log("size=", shape_counter);
	 console.log("shape = ", polygon_mode);

	 CreateBuffer(); // create VBO for the lines 
   drawScene();	 // draw the VBO 
      }


////////////////////////////////////////////////////////////////////////////////////
//
//   Mouse button handlers 
//

     function onDocumentMouseMove( event ) {
         var mouseX = event.clientX;
         var mouseY = event.ClientY;
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
         case 80: 
              if (event.shiftKey) {
                  console.log('enter P');
                  polygon_mode = 'p' 
              }
              else {
                  console.log('enter p');
                  polygon_mode = 'p'      
              }
              break;
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
      }
	console.log('polygon mode =', polygon_mode);
	console.log('color mode =', color_mode);	
    }
