///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 1 
//     Neng Shi     
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height; 

var VertexPositionBuffer;

var shape_counter = 0;     // shape size counter 
var point_counter = 0;     // point size counter 
var old_point_counter = 0;  // point_counter - old_point_counter = how many points in this run

var vbo_vertices = [];  //
var vbo_colors = []; //
var colors = [];   // store the color mode 
var shapes = [];   // store the shape mode  

var polygon_mode = 'p';  //default = p 
var color_mode  = 'r';

var circle_points = 100;

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        resize(gl.canvas)
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

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

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
    VertexPositionBuffer.numItems = point_counter;//

    VertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_colors), gl.STATIC_DRAW);
    VertexColorBuffer.itemSize = 4;
    VertexColorBuffer.numItems = point_counter;
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
    resize(gl.canvas)

    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, VertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    var i;
    var point_cursor = 0;
    for (i = 0; i < shape_counter; i++){
        if (shapes[i] == "h" ||  shapes[i] == "v"){
            gl.drawArrays(gl.LINES, point_cursor, 2);
            point_cursor += 2;
        } else if (shapes[i] == "p") {
            gl.drawArrays(gl.POINTS, point_cursor, 1);
            point_cursor += 1;
        } else if (shapes[i] == "t"){
            gl.drawArrays(gl.TRIANGLE_FAN, point_cursor, 3);
            point_cursor += 3;
        } else if (shapes[i] == "q") {
            gl.drawArrays(gl.TRIANGLE_FAN, point_cursor, 4);
            point_cursor += 4;
        } else if (shapes[i] == 'o'){
            gl.drawArrays(gl.TRIANGLE_FAN, point_cursor, circle_points);
            point_cursor += circle_points;
        }
    }
}

function clearScreen() {
    shape_counter = 0;     // shape size counter 
    point_counter = 0;     // point size counter 
    old_point_counter = 0;  // point_counter - old_point_counter = how many points in this run

    vbo_vertices = [];  // 
    vbo_colors = []; //
    colors = [];   // the array used to store color mode 
    shapes = [];   // the array to store what shapes are in the list 

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function redisplayScreen() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    CreateBuffer(); // create VBO for the lines 
    drawScene();  // draw the VBO 
}

function resize(canvas) {
    //get the canvas display size in the browser  
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    //check whether two sizes are the same 
    if (canvas.width != displayWidth || canvas.height != displayHeight){
        //set canvas size with canvas display size in the browser
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;
    }
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
   else if (polygon_mode == 't') { // add three points of the triangles 
       vbo_vertices.push(NDC_X);
       vbo_vertices.push(NDC_Y-0.05);
       vbo_vertices.push(0.0);

       vbo_vertices.push(NDC_X+0.05*Math.sqrt(3)/2);
       vbo_vertices.push(NDC_Y+0.05/2);
       vbo_vertices.push(0.0); 

       vbo_vertices.push(NDC_X-0.05*Math.sqrt(3)/2);
       vbo_vertices.push(NDC_Y+0.05/2);
       vbo_vertices.push(0.0); 

       point_counter += 3;
   } 
   else if (polygon_mode == 'q' ) { // add four points of the squares
       vbo_vertices.push(NDC_X-0.05);
       vbo_vertices.push(NDC_Y-0.05);
       vbo_vertices.push(0.0); 

       vbo_vertices.push(NDC_X+0.05);
       vbo_vertices.push(NDC_Y-0.05);
       vbo_vertices.push(0.0); 

       vbo_vertices.push(NDC_X+0.05);
       vbo_vertices.push(NDC_Y+0.05);
       vbo_vertices.push(0.0); 

       vbo_vertices.push(NDC_X-0.05);
       vbo_vertices.push(NDC_Y+0.05);
       vbo_vertices.push(0.0); 

       point_counter += 4;
   } 
   else if (polygon_mode == 'o'){ 
       var r = 0.05;

       for (var i = 0; i < circle_points; i++){
          theta = i / circle_points * 2 * Math.PI;
          var x = r * Math.sin(theta);
          var y = r * Math.cos(theta);
          vbo_vertices.push(NDC_X+x);
          vbo_vertices.push(NDC_Y+y);
          vbo_vertices.push(0.0); 
       }

       point_counter += circle_points;
   }

   var i;
   for (i = old_point_counter; i < point_counter; i++){
      if (color_mode == 'r'){
          vbo_colors.push(1.0);
          vbo_colors.push(0.0);
          vbo_colors.push(0.0);
          vbo_colors.push(1.0);
      } else if (color_mode == 'g'){
          vbo_colors.push(0.0);
          vbo_colors.push(1.0);
          vbo_colors.push(0.0);
          vbo_colors.push(1.0);
      } else if (color_mode == 'b'){
          vbo_colors.push(0.0);
          vbo_colors.push(0.0);
          vbo_colors.push(1.0);
          vbo_colors.push(1.0);
      }
   }
   old_point_counter = point_counter;
	 
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
         case 84: 
              if (event.shiftKey) {
                  console.log('enter T'); 
                  polygon_mode = 't' 
              }
              else {
                  console.log('enter t');
                  polygon_mode = 't'      
              }
              break;
         case 81: 
              if (event.shiftKey) {
                  console.log('enter Q'); 
                  polygon_mode = 'q' 
              }
              else {
                  console.log('enter q');
                  polygon_mode = 'q'      
              }
              break;  
         case 79: 
              if (event.shiftKey) {
                  console.log('enter O'); 
                  polygon_mode = 'o' 
              }
              else {
                  console.log('enter o');
                  polygon_mode = 'o'      
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
         case 67:
              if (event.shiftKey) {
                  console.log('enter C');          
              }
              else {
                  console.log('enter c');         
              }
              clearScreen();
              break;
         case 68:
              if (event.shiftKey) {
                  console.log('enter D');          
              }
              else {
                  console.log('enter d');         
              }
              redisplayScreen();

              break;          
      }
	console.log('polygon mode =', polygon_mode);
	console.log('color mode =', color_mode);	
}