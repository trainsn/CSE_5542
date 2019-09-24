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
var transformation_matrices = [];  //store the transformation matrix for each shape 

var polygon_mode = 'h';  //default = h
var color_mode  = 'r';
var transformation_mode = 0;  //0: transformation on the last shape, 1: global transformation, 2: transformation on the selected shape 

var selected_shape = -1;

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
function Transform(){
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, transformation_matrices[cursor]); 
}

function draw_points(){
    gl.bindBuffer(gl.ARRAY_BUFFER, PointVertexPositionBuffer);    // make the point current buffer 
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
    gl.bindBuffer(gl.ARRAY_BUFFER, TriangleVertexPositionBuffer);    // make the triangle current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, LineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    Transform();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, TriangleVertexPositionBuffer.numItems);
}

function draw_squares(){
    gl.bindBuffer(gl.ARRAY_BUFFER, SquareVertexPositionBuffer);    // make the square current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, LineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    Transform();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, SquareVertexPositionBuffer.numItems);
}

///////////////////////////////////////////////////////////////////////

function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX-vp_minX+1; 
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
    transformation_matrices = [];

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

    if (transformation_mode == 0){    
      shapes.push(polygon_mode);
      colors.push(color_mode); 

      var mvMatrix = mat4.create();   // this is the matrix for transforming each shape before draw 
      mat4.identity(mvMatrix);
      var trans = [0,0,0];
      trans[0] = NDC_X; 
      trans[1] = NDC_Y;
      trans[2] = 0.0; 
      mvMatrix = mat4.translate(mvMatrix, trans);
      if (shapes[cursor] == 'v')
          mvMatrix = mat4.rotate(mvMatrix, degToRad(90.0), [0, 0, 1]);  // rotate if any 
      mvMatrix = mat4.rotate(mvMatrix, degToRad(0.0), [0, 0, 1]);  // rotate if any 
      transformation_matrices.push(mvMatrix);

      shape_counter++; 
      
      console.log("size=", shape_counter);
      console.log("shape = ", polygon_mode);
      drawScene();   // draw the VBO 
    } 
    else if (transformation_mode == 2){
      selected_shape = -1;
      var min_dist = 10.0;
      var argmin_dist = -1;
      for (var i=0; i < shape_counter; i++){
          var ori_point = quat4.create([0.0, 0.0, 0.0, 1.0]);
          var center_point = quat4.create();
          mat4.multiplyVec4(transformation_matrices[i], ori_point, center_point);
          var center_x = center_point[0];
          var center_y = center_point[1];

          if ((NDC_X-center_x)*(NDC_X-center_x) + (NDC_Y-center_y)*(NDC_Y-center_y) < min_dist){
            min_dist = (NDC_X-center_x)*(NDC_X-center_x) + (NDC_Y-center_y)*(NDC_Y-center_y);
            argmin_dist = i;
          }
      }  

      if (min_dist < 0.05 * 0.05){
        selected_shape = argmin_dist;
      }
      console.log("selected_shape", selected_shape);
    } 
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

         Z_angle_delta = diffX/5;

         lastMouseX = mouseX;
         lastMouseY = mouseY;
         if (transformation_mode == 0){
            mat4.rotate(transformation_matrices[shape_counter-1], degToRad(Z_angle_delta), [0, 0, 1]);
         }
         else if (transformation_mode == 1) {
            rad = degToRad(Z_angle_delta);
            var rotation_matrix = [
                Math.cos(rad), -Math.sin(rad), 0.0, 0.0,
                Math.sin(rad), Math.cos(rad), 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
              ]            
            for (var i = 0; i < shape_counter; i++)
                mvMatrix = mat4.multiply(rotation_matrix, transformation_matrices[i], transformation_matrices[i]);   //pre-multiply
         } 
         else {
            if (selected_shape >= 0){
              mat4.rotate(transformation_matrices[selected_shape], degToRad(Z_angle_delta), [0, 0, 1]);
            }
         }


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
              }
              else {
                  console.log('enter p');      
              }
              if (transformation_mode == 0)
                polygon_mode = 'p';
              break;
         case 72:
              if (event.shiftKey) {
                  console.log('enter H');
              }
              else {
                  console.log('enter h');      
              }
              if (transformation_mode == 0)
                polygon_mode = 'h';
              break;
         case 86:
              if (event.shiftKey) {
                  console.log('enter V');          
              }
              else {
                  console.log('enter v');         
              }
              if (transformation_mode == 0)
                polygon_mode = 'v';
              break;
         case 84: 
              if (event.shiftKey) {
                  console.log('enter T'); 
              }
              else {
                  console.log('enter t');      
              }
              if (transformation_mode == 0)
                polygon_mode = 't';
              break;
         case 81: 
              if (event.shiftKey) {
                  console.log('enter Q');  
              }
              else {
                  console.log('enter q');      
              }
              if (transformation_mode == 0)
                polygon_mode = 'q';
              break;       
         case 82:
              if (event.shiftKey) {
                  console.log('enter R');            
              }
              else {
                  console.log('enter r');          
              }
              if (transformation_mode == 0){
                color_mode = 'r';
              } 
              else if (transformation_mode == 2){
                if (selected_shape >= 0){
                  colors[selected_shape] = 'r';
                  drawScene();
                }
              }
              break;
         case 71:
              if (event.shiftKey) {
                  console.log('enter G');           
              }
              else {
                  console.log('enter g');         
              }
              if (transformation_mode == 0){
                color_mode = 'g';
              } 
              else if (transformation_mode == 2){
                if (selected_shape >= 0){
                  colors[selected_shape] = 'g';
                  drawScene();
                }
              }
              break;
         case 66:
              if (event.shiftKey) {
                  console.log('enter B');            
              }
              else {
                  console.log('enter b');          
              }
              if (transformation_mode == 0){
                color_mode = 'b';
              } 
              else if (transformation_mode == 2){
                if (selected_shape >= 0){
                  colors[selected_shape] = 'b';
                  drawScene();
                }
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
                  if (transformation_mode == 0){
                      var scale = [1.1, 1.1, 1.1];
                      transformation_matrices[shape_counter-1] = mat4.scale(transformation_matrices[shape_counter-1], scale);  
                  } 
                  else if (transformation_mode == 1){
                      var scale_matrix = [
                          1.1, 0.0, 0.0, 0.0,
                          0.0, 1.1, 0.0, 0.0,
                          0.0, 0.0, 1.1, 0.0,
                          0.0, 0.0, 0.0, 1.0
                      ]
                      for (var i = 0; i < shape_counter; i++){
                        mvMatrix = mat4.multiply(scale_matrix, transformation_matrices[i], transformation_matrices[i]);   //pre-multiply 
                      }
                  }
                  else{
                      if (selected_shape >= 0){
                        var scale = [1.1, 1.1, 1.1];
                        transformation_matrices[selected_shape] = mat4.scale(transformation_matrices[selected_shape], scale);  
                      }
                  }
              }    
              else {
                  console.log('enter s');
                  if (transformation_mode == 0){
                      var scale = [0.9, 0.9, 0.9];
                      transformation_matrices[shape_counter-1] = mat4.scale(transformation_matrices[shape_counter-1], scale);  
                  }
                  else if (transformation_mode == 1){
                      var scale_matrix = [
                          0.9, 0.0, 0.0, 0.0,
                          0.0, 0.9, 0.0, 0.0,
                          0.0, 0.0, 0.9, 0.0,
                          0.0, 0.0, 0.0, 1.0
                      ]
                      for (var i = 0; i < shape_counter; i++){
                        mvMatrix = mat4.multiply(scale_matrix, transformation_matrices[i], transformation_matrices[i]);   //pre-multiply 
                      }
                  }
                  else {
                      if (selected_shape >= 0){
                        var scale = [0.9, 0.9, 0.9];
                        transformation_matrices[selected_shape] = mat4.scale(transformation_matrices[selected_shape], scale);  
                      }
                  }
              }
              drawScene();
              break;
         case 87:
              if (event.shiftKey){
                console.log('enter W');
                transformation_mode = 1;
              }
              else {
                console.log('enter w');
                transformation_mode = 0;
              }
              break;
         case 65: 
              if (event.shiftKey){
                console.log('enter A');
                transformation_mode = 2;
                selected_shape = -1;
              }
              else {
                console.log('enter a');
                transformation_mode = 0;
                selected_shape = -1;
              }
              break;
      }
	console.log('polygon mode =', polygon_mode);
	console.log('color mode =', color_mode);	
}