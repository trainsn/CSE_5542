///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 3 
//     Neng Shi     
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

var CubeVertexPositionBuffer;
var CubeVertexColorBuffer;
var CubeVertexIndexBuffer;
var CylinderVertexPositionBuffer;
var CylinderVertexColorBuffer;
var CylinderVertexIndexBuffer;
var SphereVertexPositionBuffer;
var SphereVertexColorBuffer;
var SphereVertexIndexBuffer;

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viweportHeight = canvas.height; 
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    var canvas = document.getElementById("lab3-canvas");
    initGL(canvas);
    initShaders();
    
    gl.enable(gl.DEPTH_TEST);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

    createBuffer();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);

    drawScene();
}


///////////////////////////////////////////////////////////
///////               Create VBO          /////////////////
function createCube(size){
    CubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexPositionBuffer);
    var rad = size / 2; 
    var vertices = [
          rad, rad, -rad,
          -rad, rad, -rad,
          -rad, -rad, -rad,
          rad, -rad, -rad, 
          rad, rad, rad,
          -rad, rad, rad,
          -rad, -rad, rad,
          rad, -rad, rad, 
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    CubeVertexPositionBuffer.itemSize = 3;
    CubeVertexPositionBuffer.numItems = 8;

    var indices = [0,2,1, 0,2,3, 0,3,7, 0,7,4, 6,2,3, 6,3,7, 5,1,2, 5,2,6, 5,1,0, 5,0,4, 5,6,7, 5,7,4];
    CubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    CubeVertexIndexBuffer.itemSize = 1;
    CubeVertexIndexBuffer.numItems = 36;
    

    var colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      1.0, 0.0, 0.0, 1.0, 
    ]
    CubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    CubeVertexColorBuffer.itemSize = 4;
    CubeVertexColorBuffer.numItems = 8;
}

function createCylinder(tRad, bRad, height, nSlice = 30, nStack = 1){
    var vertices = [];
    var indices = [];
    var colors = [];
    
    var aStep = Math.PI*2 / nSlice;
    var hStep = height / nStack;
    var rStep = (bRad - tRad) / nStack;

    // vertrices and colors 
    for (var i = 0; i < nSlice; i++){
        var a = i * aStep;
        for (var j = 0; j <= nStack; j++){
            var h = j * hStep - height/2;
            var r = bRad - j * rStep; 
            vertices.push(r * Math.cos(a));
            vertices.push(h);
            vertices.push(r * Math.sin(a));

            for (var k = 0; k < 3; k++){
              if (i % 3 == k)
                colors.push(1.0);
              else 
                colors.push(0.0);
            }
            colors.push(1.0);
        }
    } 

    CylinderVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    CylinderVertexPositionBuffer.itemSize = 3;
    CylinderVertexPositionBuffer.numItems = nSlice * (nStack+1);

    CylinderVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    CylinderVertexColorBuffer.itemSize = 4;
    CylinderVertexColorBuffer.numItems = nSlice * (nStack+1);

    //indices 
    for (var i = 0; i < nSlice; i++){
        var start = i * (nStack+1);
        var next = (i+1)%nSlice * (nStack+1);

        // bottom face & top face 
        indices.push(0, start, next);
        indices.push(nStack, start+nStack, next+nStack);  
        // side face
        for (var j = 0; j <= nStack; j++){
            indices.push(start+j, next+j, start+j+1);
            indices.push(start+j+1, next+j+1, next+j);
        }
    }

    CylinderVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CylinderVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    CylinderVertexIndexBuffer.itemSize = 1;
    CylinderVertexIndexBuffer.numItems = indices.length;
}

function createSphere(rad, nSlice=20, nStack = 20) {
    var vertices = [];
    var indices = [];
    var colors = [];

    var height = 2 * rad;
    var aStep = Math.PI*2 / nSlice;
    var hStep = Math.PI / nStack;

    // vertices and colors
    vertices.push(0.0, -rad, 0.0);
    colors.push(1.0, 0.0, 0.0, 1.0);
    for (var j = 1; j < nStack; j++){
        var h = -Math.PI/2 + hStep*j;
        for (var i = 0; i < nSlice; i++){
            var a = i * aStep;
            vertices.push(Math.cos(h) * Math.cos(a) * rad);
            vertices.push(Math.sin(h) * rad);
            vertices.push(Math.cos(h) * Math.sin(a) * rad);

            for (var k = 0; k < 3; k++){
              if (i % 3 == k)
                colors.push(1.0);
              else 
                colors.push(0.0);
            }
            colors.push(1.0);
        }        
    }
    vertices.push(0.0, rad, 0.0);
    colors.push(1.0, 0.0, 0.0, 1.0);

    SphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    SphereVertexPositionBuffer.itemSize = 3;
    SphereVertexPositionBuffer.numItems = nSlice * (nStack-1) + 2;

    SphereVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    SphereVertexColorBuffer.itemSize = 4;
    SphereVertexColorBuffer.numItems = nSlice * (nStack-1) + 2;

    // indices 
    for (var i = 0; i < nSlice; i++)
        indices.push(0, 1 + i, 1 + (i+1)%nSlice);
    for (var j = 0;  j < nStack-2; j++){
        for (var i=0; i<nSlice; i++){
            var start = j * nSlice + 1 + i;
            var next =  j * nSlice + 1 + (i+1)%nSlice;
            indices.push(start, next, start+nSlice);
            indices.push(next, next+nSlice, start+nSlice);
        }
    } 
    for (var i = 0; i < nSlice; i++){
        var start = (nStack-2) * nSlice + 1 + i;
        var next =  (nStack-2) * nSlice + 1 + (i+1)%nSlice;
        indices.push(start, next, nSlice * (nStack-1) + 1); 
    }   

    SphereVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, SphereVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    SphereVertexIndexBuffer.itemSize = 1;
    SphereVertexIndexBuffer.numItems = indices.length;    
}

function createBuffer() {
    createCube(1);
    createCylinder(1, 1, 1);
    createSphere(1);
}

///////////////////////////////////////////////////////
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

///////////////////////////////////////////////////////////////////////
var vMatrix = mat4.create();
var mMatrix = mat4.create();
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var front_incre = 0.0;
var left_incre = 0.0;

var angle_step = 3.0;
var arm1Yangle = 0.0;
var joint1Xangle = 45.0;
var palmYangle = 0.0;
var joint2Zangle = 0.0;

function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

function drawCube(){
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexPositionBuffer);    // make the cube current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, CubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, CubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeVertexIndexBuffer);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, CubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawCylinder(){
    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexPositionBuffer);    // make the cube current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, CylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, CylinderVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CylinderVertexIndexBuffer);

    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, CylinderVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawSphere(){
    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexPositionBuffer);    // make the cube current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, SphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, SphereVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, SphereVertexIndexBuffer);
    setMatrixUniforms();

    gl.drawElements(gl.TRIANGLES, SphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

///////////////////////////////////////////////////////////////////////

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viweportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.lookAt([3,2,4], [0,0,0], [0,1,0], vMatrix);
    mat4.perspective(60, 1.0, 0.1, 100, pMatrix);

    mat4.identity(mMatrix); 
    // global move
    mat4.translate(mMatrix, [left_incre, 0, front_incre], mMatrix);

    // lower part: car + wheels 
    createCylinder(1, 1, 1);
    pushMatrix(mMatrix);
      // car cube
      var carLength = 4.0;
      var carWidth  = 2.0;
      var carHeight = 0.5;
      mat4.translate(mMatrix, [0, -carHeight/2, 0], mMatrix);
      pushMatrix(mMatrix);
        mat4.scale(mMatrix, [carWidth, carHeight, carLength], mMatrix);
        mat4.multiply(vMatrix, mMatrix, mvMatrix);
        drawCube();
      mat4.set(popMatrix(), mMatrix); 

      //wheels cylinder
      var wheelCount = 8;
      var wheelRad = carLength / wheelCount / 2;
      var wheelHeight = 0.3;
      // right side
      pushMatrix(mMatrix);
          mat4.translate(mMatrix, [carWidth/2-wheelHeight/2, -wheelRad-carHeight/2, -carLength/2-wheelRad], mMatrix);
          for (var i = 0; i < wheelCount; i++){
              mat4.translate(mMatrix, [0, 0, 2*wheelRad], mMatrix);
              pushMatrix(mMatrix);
                mat4.rotate(mMatrix, degToRad(90.0), [0,0,1], mMatrix);
                pushMatrix(mMatrix);
                  mat4.scale(mMatrix, [wheelRad, wheelHeight, wheelRad], mMatrix);
                  mat4.multiply(vMatrix, mMatrix, mvMatrix);
                  drawCylinder();
                mat4.set(popMatrix(), mMatrix);
              mat4.set(popMatrix(), mMatrix);
          }  
      mat4.set(popMatrix(), mMatrix); 
      // left side 
      pushMatrix(mMatrix);
          mat4.translate(mMatrix, [-carWidth/2+wheelHeight/2, -wheelRad-carHeight/2, -carLength/2-wheelRad], mMatrix);
          for (var i = 0; i < wheelCount; i++){
              mat4.translate(mMatrix, [0, 0, 2*wheelRad], mMatrix);
              pushMatrix(mMatrix);
                mat4.rotate(mMatrix, degToRad(90.0), [0,0,1], mMatrix);
                pushMatrix(mMatrix);
                  mat4.scale(mMatrix, [wheelRad, wheelHeight, wheelRad], mMatrix);
                  mat4.multiply(vMatrix, mMatrix, mvMatrix);
                  drawCylinder();
                mat4.set(popMatrix(), mMatrix);
              mat4.set(popMatrix(), mMatrix);
          }  
      mat4.set(popMatrix(), mMatrix); 
      

    mat4.set(popMatrix(), mMatrix);

    // cylinder base 
    var baseHeight = 0.1;
    var baseRad = 1;
    mat4.translate(mMatrix, [0, baseHeight/2, 0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [baseRad, baseHeight, baseRad], mMatrix);
      mat4.multiply(vMatrix, mMatrix, mvMatrix);
      drawCylinder();
    mat4.set(popMatrix(), mMatrix);

    // Arm1 Cube
    var arm1Height = 0.1;
    var arm1Width = 0.3;
    mat4.translate(mMatrix, [0, baseHeight/2+arm1Height/2, 0], mMatrix);
    mat4.rotate(mMatrix, degToRad(arm1Yangle), [0, 1, 0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [arm1Width, arm1Height, arm1Width], mMatrix);
      mat4.multiply(vMatrix, mMatrix, mvMatrix);
      drawCube();
    mat4.set(popMatrix(), mMatrix);

    // Joint1 sphere
    var joint1Rad = 0.2;
    mat4.translate(mMatrix, [0, arm1Height/2+joint1Rad/2, 0], mMatrix);
    mat4.rotate(mMatrix, degToRad(joint1Xangle), [1,0,0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [joint1Rad, joint1Rad, joint1Rad], mMatrix);
      mat4.multiply(vMatrix, mMatrix, mvMatrix);
      drawSphere();
    mat4.set(popMatrix(), mMatrix); 

    // Arm2 Cube
    var arm2Height = 1;
    var arm2Width = 0.4;
    mat4.translate(mMatrix, [0, joint1Rad/2+arm2Height/2, 0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [arm2Width, arm2Height, arm2Width], mMatrix);
      mat4.multiply(vMatrix, mMatrix, mvMatrix);
      drawCube();
    mat4.set(popMatrix(), mMatrix);

    // Palm 
    var palmHeight = 0.2;
    var palmLength = 0.6;
    var palmWidth = 0.2;
    mat4.translate(mMatrix, [0, arm2Height/2+palmHeight/2, 0], mMatrix);
    mat4.rotate(mMatrix, degToRad(palmYangle), [0,1,0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [palmLength, palmHeight, palmWidth], mMatrix);
      mat4.multiply(vMatrix, mMatrix, mvMatrix);
      drawCube();
    mat4.set(popMatrix(), mMatrix);
    
    // joint2 + Fingers
    createCylinder(0, 1, 1);
    var joint2Rad = 0.05;
    var fingerHeight = 0.2;
    var fingerRad  = 0.05;
    var fingerCount = 2;
    mat4.translate(mMatrix, [0, palmHeight/2+joint2Rad, 0], mMatrix);
    for (var i = 0; i < fingerCount; i++){
        var dx = ((i+0.5) / fingerCount - 0.5) / 2;
        pushMatrix(mMatrix);
          //joint 2 - sphere
          mat4.translate(mMatrix, [dx, 0, 0], mMatrix);
          mat4.rotate(mMatrix, degToRad(joint2Zangle), [0,0,1], mMatrix);
          pushMatrix(mMatrix);
            mat4.scale(mMatrix, [joint2Rad, joint2Rad, joint2Rad], mMatrix);
            mat4.multiply(vMatrix, mMatrix, mvMatrix);
            drawSphere();            
          mat4.set(popMatrix(), mMatrix);
          //finger - cone 
          mat4.translate(mMatrix, [0, joint2Rad/2+fingerHeight/2, 0], mMatrix);
          pushMatrix(mMatrix);
            mat4.scale(mMatrix, [fingerRad, fingerHeight, fingerRad], mMatrix);
            mat4.multiply(vMatrix, mMatrix, mvMatrix);
            drawCylinder();
          mat4.set(popMatrix(), mMatrix);  
        mat4.set(popMatrix(), mMatrix);
    }

}

var matrixStack = [];
function pushMatrix(m){
    var m2 = mat4.create(m);
    matrixStack.push(m2);
}

function popMatrix(){
    return matrixStack.pop();
}

///////////////////////////////////////////////////////////////
//   Below are mouse and key event handlers 
//
var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////

  function onDocumentMouseDown( event ) {

}
////////////////////////////////////////////////////////////////////////////////////
//
//   Mouse button handlers 
//
     function onDocumentMouseMove( event ) {

     }

     function onDocumentMouseUp( event ) {
 
     }

     function onDocumentMouseOut( event ) {

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
              break;
          case 87:
              console.log('enter W');
              front_incre -= 0.03;
              drawScene();
              break;
          case 83:
              console.log('enter S');
              front_incre += 0.03;
              drawScene();
              break;
          case 65:
              console.log('enter A');
              left_incre -= 0.03;
              drawScene();
              break;
          case 68:
              console.log('enter D');
              left_incre += 0.03;
              drawScene();
              break;
          case 38: 
              console.log('enter up arrow key');
              if (joint1Xangle < 80.0)
                joint1Xangle += angle_step;
              drawScene();
              break; 
          case 40: 
              console.log('enter down arrow key');
              if (joint1Xangle > -80.0)
                  joint1Xangle -= angle_step;
              drawScene();
              break;   
          case 37:
              console.log('enter left arrow key');
              arm1Yangle -= angle_step;
              drawScene();
              break;  
          case 39:
              console.log('enter right arrow');
              arm1Yangle += angle_step;;
              drawScene();
              break;   
          case 90:
              console.log('enter Z');
              palmYangle -= angle_step;
              drawScene();
              break;
          case 88:
              console.log('enter X');
              palmYangle += angle_step;
              drawScene();
              break;
          case 67:
              console.log('enter C');
              if (joint2Zangle < 60.0)
                joint2Zangle += angle_step;
              drawScene();
              break;
          case 86:
              console.log('enter V');
              if (joint2Zangle > -60.0)
                joint2Zangle -= angle_step;
              drawScene();
              break;
      }
}