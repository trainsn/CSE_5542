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
function createCube(){
    CubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexPositionBuffer);
    var vertices = [
          0.5, 0.5, -0.5,
          -0.5, 0.5, -0.5,
          -0.5, -0.5, -0.5,
          0.5, -0.5, -0.5, 
          0.5, 0.5, 0.5,
          -0.5, 0.5, 0.5,
          -0.5, -0.5, 0.5,
          0.5, -0.5, 0.5, 
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

function createCylinder(tRad, bRad, height, nSlice = 20, nStack = 1){
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
            var h = j * hStep;
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

function createBuffer() {
    createCube();
    createCylinder(0.0, 0.5, 1);
    
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
var Z_angle = 0.0;

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

///////////////////////////////////////////////////////////////////////

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viweportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.lookAt([0,0,5], [0,0,0], [0,1,0], vMatrix);
    mat4.perspective(60, 1.0, 0.1, 100, pMatrix);

    mat4.identity(mMatrix); 
    mat4.translate(mMatrix, [left_incre, 0, front_incre], mMatrix);
    mat4.multiply(vMatrix, mMatrix, mvMatrix);

    drawCylinder();
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
              front_incre += 0.03;
              drawScene();
              break;
          case 83:
              console.log('enter S');
              front_incre -= 0.03;
              drawScene();
              break;
          case 65:
              console.log('enter A');
              left_incre += 0.03;
              drawScene();
              break;
          case 68:
              console.log('enter D');
              left_incre -= 0.03;
              drawScene();
              break;
      }
}