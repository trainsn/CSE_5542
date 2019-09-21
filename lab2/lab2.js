///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 2 
//     Neng Shi     
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height; 

var PointVertexPositionBuffer;
var LineVertexPositionBuffer;
var TriangleVertexPositionBuffer;
var SquareVertexPositionBuffer;

var shape_counter = 0;     // shape size counter 
var cursor = 0;   

var colors = [];   // store the color mode 
var shapes = [];   // store the shape mode 
var shapes_tx = []; // x translation 
var shapes_ty = []; // y translation 
var shapes_rotation = []; // rotation angle
var shapes_scale = [];  // scaling factor (uniform is assumed)

var polygon_mode = 'h';  //default = h
var color_mode  = 'r';

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        resizeCanvas();
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    var canvas = document.getElementById("lab2-canvas");
    initGL(canvas);
    initShaders();
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.vColorLocation = gl.getUniformLocation(shaderProgram, "vColor");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    initScene();
    
    document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);

    window.addEventListener('resize', resizeCanvas);
}


///////////////////////////////////////////////////////////
///////               Create VBO          /////////////////
function CreateBuffer() {
    var point_vertices = [
            0.0, 0.0,  0.0
        ];
    PointVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, PointVertexPositionBuffer);
    PointVertexPositionBuffer.itemSize = 3;
    PointVertexPositionBuffer.numItems = 1;

    var line_vertices  = [         // A VBO for horizontal line in a standard position. To be translated to position of mouse click 
             -0.1, 0.0,  0.0,
             0.1, 0.0,  0.0
        ];
    LineVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, LineVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line_vertices), gl.STATIC_DRAW);
    LineVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    LineVertexPositionBuffer.numItems = 2;  //

    var triangle_vertices = [
          0.0, -0.05, 0.0,
          0.05*Math.sqrt(3)/2, 0.05/2, 0.0,
          -0.05*Math.sqrt(3)/2, 0.05/2, 0.0 
    ];
    TriangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TriangleVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertices), gl.STATIC_DRAW);
    TriangleVertexPositionBuffer.itemSize = 3;
    TriangleVertexPositionBuffer.numItems = 3;


    var square_vertices = [
          -0.05, -0.05, 0.0,
          0.05, -0.05, 0.0,
          0.05, 0.05, 0.0,
          -0.05, 0.05, 0.0
    ];
    SquareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, SquareVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square_vertices), gl.STATIC_DRAW);
    SquareVertexPositionBuffer.itemSize = 3;
    SquareVertexPositionBuffer.numItems = 4;
}

///////////////////////////////////////////////////////
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

///////////////////////////////////////////////////////////////////////
var mvMatrix = mat4.create();   // this is the matrix for transforming each shape before draw 
function Transform(){
    mat4.identity(mvMatrix);
    var trans = [0,0,0];
    trans[0] = shapes_tx[cursor]; 
    trans[1] = shapes_ty[cursor];
    trans[2] = 0.0; 
    mvMatrix = mat4.translate(mvMatrix, trans);  // move from origin to mouse click 
    if (shapes[cursor] == 'v')
        mvMatrix = mat4.rotate(mvMatrix, degToRad(90.0), [0, 0, 1]);  // rotate if any 
    mvMatrix = mat4.rotate(mvMatrix, degToRad(shapes_rotation[cursor]), [0, 0, 1]);  // rotate if any 
    var scale = [1,1,1];
    scale[0] = scale[1] = scale[2] = shapes_scale[cursor]; 
    mvMatrix = mat4.scale(mvMatrix, scale);  // scale if any 

    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix); 
}

function draw_points(){
    gl.bindBuffer(gl.ARRAY_BUFFER, PointVertexPositionBuffer);    // make the line current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, PointVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    Transform();
    gl.drawArrays(gl.POINTS, 0, PointVertexPositionBuffer.numItems);
}

function draw_lines() {   
    gl.bindBuffer(gl.ARRAY_BUFFER, LineVertexPositionBuffer);    // make the line current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, LineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    Transform();
    gl.drawArrays(gl.LINES, 0, LineVertexPositionBuffer.numItems);
}

function draw_triangles(){
    gl.bindBuffer(gl.ARRAY_BUFFER, TriangleVertexPositionBuffer);    // make the line current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, LineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    Transform();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, TriangleVertexPositionBuffer.numItems);
}

function draw_squares(){
    gl.bindBuffer(gl.ARRAY_BUFFER, SquareVertexPositionBuffer);    // make the line current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, LineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    Transform();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, SquareVertexPositionBuffer.numItems);
}

///////////////////////////////////////////////////////////////////////

function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    CreateBuffer();
}

function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (cursor=0; cursor < shape_counter; cursor++){
        if (colors[cursor] == "r"){
            gl.uniform4f(shaderProgram.vColorLocation, 1.0, 0.0, 0.0, 1.0);
        } else if (colors[cursor] == "g"){
            gl.uniform4f(shaderProgram.vColorLocation, 0.0, 1.0, 0.0, 1.0);
        } else if (colors[cursor] == "b"){
            gl.uniform4f(shaderProgram.vColorLocation, 0.0, 0.0, 1.0, 1.0);
        }

        if (shapes[cursor] == 'p')
            draw_points();
        else if (shapes[cursor] == 'h' || shapes[cursor] == 'v')
            draw_lines();
        else if (shapes[cursor] == 't')
            draw_triangles();
        else if (shapes[cursor] == 'q')
            draw_squares();
    }
    
}

function clearScreen() {
    shape_counter = 0;     // shape size counter 
    cursor = 0;   

    colors = [];   // the array used to store color mode 
    shapes = [];   // the array to store what shapes are in the list 
    shapes_tx = []; // x translation 
    shapes_ty = []; // y translation 
    shapes_rotation = []; // rotation angle
    shapes_scale = [];  // scaling factor (uniform is assumed)

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function redisplayScreen() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    drawScene();  // draw the VBO 
}

function resizeCanvas() {
    //get the canvas display size in the browser  
    var displayWidth = gl.canvas.clientWidth;
    var displayHeight = gl.canvas.clientHeight;

    //check whether two sizes are the same 
    if (gl.canvas.width != displayWidth || gl.canvas.height != displayHeight){
        //set canvas size with canvas display size in the browser
        gl.canvas.width = displayWidth;
        gl.canvas.height = displayHeight;

        gl.canvasWidth = gl.canvas.width;
        gl.canvasHeight = gl.canvas.height;
    }

    redisplayScreen();
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
    var mouseY = event.clientY;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    //get canvas' coordinate from the browser client area
    var rect = event.target.getBoundingClientRect();

    //tranform the coordinate from client area to canvas, then tranform to webgl
    NDC_X = ((event.clientX - rect.left) - vp_width/2) / (vp_width/2);
    NDC_Y = (vp_height/2 - (event.clientY - rect.top)) / (vp_height/2);
    console.log("NDC click", event.clientX, event.clientY, NDC_X, NDC_Y);
    
    shapes.push(polygon_mode);
    colors.push(color_mode); 
    shapes_tx.push(NDC_X); 
    shapes_ty.push(NDC_Y); 
    shapes_rotation.push(0.0); 
    shapes_scale.push(1.0);
    
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

     function onDocumentMouseMove( event ) {
         var mouseX = event.clientX;
         var mouseY = event.ClientY;

         var diffX = mouseX - lastMouseX;
         var diffY = mouseY - lastMouseY;

         Z_angle = Z_angle + diffX/5;

         lastMouseX = mouseX;
         lastMouseY = mouseY;
         shapes_rotation[shape_counter-1] = Z_angle; //update the rotation angle

         drawScene();
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
         case 83: 
              if (event.shiftKey) {
                  console.log('enter S');
                  shapes_scale[shape_counter-1] *= 1.1; 
              }    
              else {
                  console.log('enter s');
                  shapes_scale[shape_counter-1] *= 0.9;
              }
              drawScene();
              break;
      }
	console.log('polygon mode =', polygon_mode);
	console.log('color mode =', color_mode);	
}