///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 5 
//     Neng Shi     
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

var CubeVertexPositionBuffer;
var CubeVertexTextureCoordBuffer; 
var CubeVertexIndexBuffer;
var CubeVertexNormalBuffer;
var CylinderVertexPositionBuffer;
var CylinderVertexTextureCoordBuffer;
var CylinderVertexIndexBuffer;
var CylinderVertexNormalBuffer;
var SphereVertexPositionBuffer;
var SphereVertexTextureCoordBuffer;
var SphereVertexIndexBuffer;
var SphereVertexNormalBuffer;

var teardropVertexPositionBuffer;
var teardropVertexTextureCoordBuffer;
var teardropVertexIndexBuffer;
var teardropVertexNormalBuffer;

var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer;
var teapotVertexIndexBuffer; 
var robotVertexPositionBuffer;
var robotVertexTextureCoordBuffer; 
var robotVertexNormalBuffer;
var robotVertexIndexBuffer; 

var light_pos = [0.0, 5, 0.0, 1.0]; // light pos in eye space 
var light_size = 0.2;
var light_color = [1.0,1.0,1.0,1.0];
var mat_ambient = [0.0, 0.2, 0, 1]; 
var mat_diffuse = [0.0, 0.0, 0.0, 0.0]; 
var mat_specular = [0.5, 0.5, 0.5, 1]; 
var mat_shininess = [50.0]; 

var front_incre = 0.0;
var left_incre = 0.0;

// skybox
var skyDis = 50.0;

// car cube 
var carLength = 4.0;
var carWidth  = 2.0;
var carHeight = 0.6;
// wheels cylinder 
var wheelCount = 8;
var wheelRad = carLength / wheelCount / 2;
var wheelHeight = 0.3;
// ground cube 
var groundWidth = 200.0;
var groundHeight = 0.05;

// base cylinder 
var baseHeight = 0.1;
var baseRad = 1;
// arm1 cube  
var arm1Height = 0.1;
var arm1Width = 0.3;
// joint1 sphere
var joint1Rad = 0.2;
// arm2 cube  
var arm2Height = 0.7;
var arm2Width = 0.4;
// joint2 + finger 
var joint2Rad = 0.05;
var fingerHeight = 0.6;
var fingerRad  = 0.05;
var fingerCount = 1;

var angle_step = 3.0;
var arm1Yangle = 0.0;
var joint1Xangle = -45.0;
var palmYangle = 0.0;
var joint2Zangle = 0.0;
var joint2Matrix = mat4.create();
mat4.identity(joint2Matrix);

var robot_base = 10;
var robot_size = 0.3;
var attack_base = 0.2;
var attack_size = 0.3;

var modelTexture;
var tearTexture;
var skyboxTexture_px;
var skyboxTexture_nx;
var skyboxTexture_py;
var skyboxTexture_ny;
var skyboxTexture_pz;
var skyboxTexture_nz;
var choosenTexture;
var cubemapTexture;
var textureLoaded = 0;
var use_texture;

var total_image = 14;

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
    var canvas = document.getElementById("lab5-canvas");
    initGL(canvas);
    initShaders();
    
    gl.enable(gl.DEPTH_TEST);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
    gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "uV2WMatrix");

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    shaderProgram.light_colorUniform = gl.getUniformLocation(shaderProgram, "light_color");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");
 
    initCubeMap();
    shaderProgram.cubeMap_textureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");


    initTextures();
    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
    shaderProgram.use_textureUniform = gl.getUniformLocation(shaderProgram, "use_texture");

    initJSON("model//robot");
    // initTeapot();
    createCube(1);
    createCylinder(1, 1, 1);
    createSphere(1);
    createTeardrop();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    document.addEventListener('keydown', onKeyDown, false);
}

///////////////////////////////////////////////////////////////
function initTextures() {
    modelTexture = gl.createTexture();
    modelTexture.image = new Image();
    modelTexture.image.onload = function(){
        handleTextureLoaded(modelTexture);
    }
    modelTexture.image.src = "model/robot.jpg";

    tearTexture = gl.createTexture();
    tearTexture.image = new Image();
    tearTexture.image.onload = function(){
        handleTextureLoaded(tearTexture);
    }
    tearTexture.image.src = "textures/universe2.jpg";

    skyboxTexture_px = gl.createTexture();
    skyboxTexture_px.image = new Image();
    skyboxTexture_px.image.onload = function(){
        handleTextureLoaded(skyboxTexture_px);
    }
    skyboxTexture_px.image.src = cubemapTexture.px.src;

    skyboxTexture_nx = gl.createTexture();
    skyboxTexture_nx.image = new Image();
    skyboxTexture_nx.image.onload = function(){
        handleTextureLoaded(skyboxTexture_nx);
    }
    skyboxTexture_nx.image.src = cubemapTexture.nx.src;

    skyboxTexture_py = gl.createTexture();
    skyboxTexture_py.image = new Image();
    skyboxTexture_py.image.onload = function(){
        handleTextureLoaded(skyboxTexture_py);
    }
    skyboxTexture_py.image.src = cubemapTexture.py.src;

    skyboxTexture_ny = gl.createTexture();
    skyboxTexture_ny.image = new Image();
    skyboxTexture_ny.image.onload = function(){
        handleTextureLoaded(skyboxTexture_ny);
    }
    skyboxTexture_ny.image.src = cubemapTexture.ny.src;

    skyboxTexture_pz = gl.createTexture();
    skyboxTexture_pz.image = new Image();
    skyboxTexture_pz.image.onload = function(){
        handleTextureLoaded(skyboxTexture_pz);
    }
    skyboxTexture_pz.image.src = cubemapTexture.pz.src;

    skyboxTexture_nz = gl.createTexture();
    skyboxTexture_nz.image = new Image();
    skyboxTexture_nz.image.onload = function(){
        handleTextureLoaded(skyboxTexture_nz);
    }
    skyboxTexture_nz.image.src = cubemapTexture.nz.src;

    console.log("loading texture....")
}

function handleTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WARP_S, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WARP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);    // what's that for?
    textureLoaded++; 
    setupDrawScene();
}

function initCubeMap(){
    cubemapTexture = gl.createTexture();

    cubemapTexture.px = new Image();
    cubemapTexture.px.onload = function(){
        handleCubemapTextureLoaded(cubemapTexture, 'px');
    }
    cubemapTexture.px.src = "skybox/Areskutan/posx.jpg";

    cubemapTexture.nx = new Image();
    cubemapTexture.nx.onload = function(){
        handleCubemapTextureLoaded(cubemapTexture, 'nx');
    }
    cubemapTexture.nx.src = "skybox/Areskutan/negx.jpg";

    cubemapTexture.py = new Image();
    cubemapTexture.py.onload = function(){
        handleCubemapTextureLoaded(cubemapTexture, 'py');
    }
    cubemapTexture.py.src = "skybox/Areskutan/posy.jpg";

    cubemapTexture.ny = new Image();
    cubemapTexture.ny.onload = function(){
        handleCubemapTextureLoaded(cubemapTexture, 'ny');
    }
    cubemapTexture.ny.src = "skybox/Areskutan/negy.jpg";

    cubemapTexture.pz = new Image();
    cubemapTexture.pz.onload = function(){
        handleCubemapTextureLoaded(cubemapTexture, 'pz');
    }
    cubemapTexture.pz.src = "skybox/Areskutan/posz.jpg";

    cubemapTexture.nz = new Image();
    cubemapTexture.nz.onload = function(){
        handleCubemapTextureLoaded(cubemapTexture, 'nz');
    }
    cubemapTexture.nz.src = "skybox/Areskutan/negz.jpg";

    console.log("loading cubemap texture...");
}

function handleCubemapTextureLoaded(texture, type){
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    switch (type){
        case 'px':
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, 
                gl.UNSIGNED_BYTE, texture.px);
            break;
        case 'nx':
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB,
                gl.UNSIGNED_BYTE, texture.nx);
            break;
        case 'py':
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB,
                gl.UNSIGNED_BYTE, texture.py);
            break;
        case 'ny':
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB,
                gl.UNSIGNED_BYTE, texture.ny);
            break;
        case 'pz':
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB,
                gl.UNSIGNED_BYTE, texture.pz);
            break;
        case 'nz':
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB,
                gl.UNSIGNED_BYTE, texture.nz);
            break;
    } 
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    textureLoaded++;

    setupDrawScene();
}


///////////////////////////////////////////////////////////
///////               Create VBO          /////////////////
function createTeardrop(nSlice=20, nStack=20){
    var vertices = [];
    var indices = [];
    var normals = [];
    var texcoords = [];

    var aStep = Math.PI*2 / nSlice;
    var hStep = Math.PI / nStack;

    // vertices, texcoords, normals
    for (var i = 0; i <= nSlice; i++){
        var a = i * aStep;
        vertices.push(0.0, 1.0, 0.0);
        normals.push(0.0, 1.0, 0.0);
        texcoords.push(a/(Math.PI*2), 0.0);
    }
    
    for (var j = 1; j < nStack; j++){
        var h = hStep * j;
        for (var i = 0; i <= nSlice; i++){
            var a = i * aStep;
            var x = 0.5 * (1 - Math.cos(h)) * Math.sin(h) * Math.sin(a);
            var y = Math.cos(h);
            var z = 0.5 * (1 - Math.cos(h)) * Math.sin(h) * Math.cos(a);

            var dxda = 0.5 * Math.cos(a) * (1 - Math.cos(h)) * Math.sin(h);
            var dyda = 0;
            var dzda = -0.5 * Math.sin(a) * (1 - Math.cos(h)) * Math.sin(h);

            var dxdh = 0.5 * Math.sin(a) * 
            (Math.cos(h) * (1 - Math.cos(h)) + Math.sin(h) * Math.sin(h));
            var dydh = -Math.sin(h);
            var dzdh = 0.5 * Math.cos(a) * 
            (Math.cos(h) * (1 - Math.cos(h)) + Math.sin(h) * Math.sin(h));

            var dpda = [dxda, dyda, dzda];
            var dpdh = [dxdh, dydh, dzdh];
            var nn = vec3.cross(dpdh, dpda);

            if (i == nSlice*2/4 && j == nStack/2){
                var test = 1;
            }

            vertices.push(x, y, z);
            normals.push(nn[0], nn[1], nn[2]);
            texcoords.push(a/(Math.PI*2), h/Math.PI);
        }
    }

    for (var i = 0; i <= nSlice; i++){
        var a = i * aStep;
        vertices.push(0.0, -1.0, 0.0);
        normals.push(0.0, -1.0, 0.0);
        texcoords.push(a/(Math.PI*2), 1.0);
    }

    teardropVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teardropVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    teardropVertexPositionBuffer.itemSize = 3;
    teardropVertexPositionBuffer.numItems = (nSlice+1) * (nStack+1);

    teardropVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teardropVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    teardropVertexTextureCoordBuffer.itemSize = 2;
    teardropVertexTextureCoordBuffer.numItems = (nSlice+1) * (nStack+1);

    teardropVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teardropVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    teardropVertexNormalBuffer.itemSize = 3;
    teardropVertexNormalBuffer.numItems = (nSlice+1) * (nStack+1);

    // indices 
    for (var j = 0; j < nStack; j++){
        for (var i = 0; i <= nSlice; i++){
            var start = j * nSlice + i;
            var next = j * nSlice + (i+1); 
            indices.push(start, next, start+nSlice+1);
            indices.push(next, start+nSlice+1, next+nSlice+1);
        }
    }

    teardropVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teardropVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    teardropVertexIndexBuffer.itemSize = 1;
    teardropVertexIndexBuffer.numItems = indices.length;   
}

function initJSON(name){
    var request = new XMLHttpRequest();
    request.open("GET", name+".json");
    request.onreadystatechange = 
      function (){
          if (request.readyState == 4){
              console.log("state = " + request.readyState);
              handleLoaded(JSON.parse(request.responseText), name);
          }
      }
    request.send();
}

function handleLoaded(data, name){
    console.log("int handleLoaded");
    var vertices = [];
    for (var i = 0; i < data.vertices.length; i++){
        vertices.push(data.vertices[i] * robot_size);
    }
    for (var i = 0; i < vertices.length; i+=3){
        if (vertices[i+1] < robot_base)
            robot_base = vertices[i+1];
    }
    robotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, robotVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    robotVertexPositionBuffer.itemSize = 3;
    robotVertexPositionBuffer.numItems = vertices.length / 3;

    var texcoords = [];
    for (var i = 0; i < data.uvs[0].length; i+=2){
        texcoords.push(data.uvs[0][i]);
        texcoords.push(-data.uvs[0][i+1]);
    }
    robotVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, robotVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    robotVertexTextureCoordBuffer.itemSize = 2;
    robotVertexTextureCoordBuffer.numItems = texcoords.length / 2;

    var indices = [];
    for (var i = 0; i < data.faces.length; i += 11){
        indices.push(data.faces[i+1]);
        indices.push(data.faces[i+2]);
        indices.push(data.faces[i+3]);
    }
    robotVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, robotVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    robotVertexIndexBuffer.itemSize = 1;
    robotVertexIndexBuffer.numItems = indices.length;

    var normals = [];
    for (var i = 0; i < data.vertices.length; i++){
        normals.push(0.0);
    }
    for (var i = 0; i < indices.length; i+=3){
        var p1 = [
            data.vertices[indices[i]*3], 
            data.vertices[indices[i]*3+1], 
            data.vertices[indices[i]*3+2]
        ];
        var p2 = [
            data.vertices[indices[i+1]*3], 
            data.vertices[indices[i+1]*3+1], 
            data.vertices[indices[i+1]*3+2]
        ];
        var p3 = [
            data.vertices[indices[i+2]*3], 
            data.vertices[indices[i+2]*3+1], 
            data.vertices[indices[i+2]*3+2]
        ];
        var v1 = vector(p1, p2);
        var v2 = vector(p1, p3);
        var nn = vec3.cross(v1, v2);
        normals[indices[i]*3] += nn[0];  normals[indices[i]*3+1] += nn[1]; normals[indices[i]*3+2] += nn[2];
        normals[indices[i+1]*3] += nn[0];  normals[indices[i+1]*3+1] += nn[1]; normals[indices[i+1]*3+2] += nn[2];
        normals[indices[i+2]*3] += nn[0];  normals[indices[i+2]*3+1] += nn[1]; normals[indices[i+2]*3+2] += nn[2];
    }
    robotVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, robotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    robotVertexNormalBuffer.itemSize = 3;
    robotVertexNormalBuffer.numItems = normals.length / 3;

    setupDrawScene();
}

function vector(a, b){
    return [-a[0]+b[0], -a[1]+b[1], -a[2]+b[2]];
}


function createCube(size){  
    var rad = size / 2; 
    var vertices = [
          rad, rad, rad,    -rad, rad, rad,     -rad, -rad, rad,    rad, -rad, rad, //v0, v1, v2, v3 front 
          rad, rad, rad,    rad, -rad, rad,     rad, -rad, -rad,    rad, rad, -rad, //v0, v3, v4, v5 right
          rad, -rad, -rad,  rad, rad, -rad,     -rad, rad, -rad,    -rad,-rad,-rad,// v4, v5, v6, v7 back
          -rad, rad, rad,   -rad, -rad, rad,    -rad, rad, -rad,    -rad, -rad, -rad,// v1, v2, v6, v7 left
          rad, rad, rad,    -rad, rad, rad,     rad, rad, -rad,     -rad, rad, -rad, // v0, v1, v5, v6 up 
          -rad, -rad, rad,  rad, -rad, rad,     rad, -rad, -rad,    -rad, -rad, -rad// v2, v3, v4, v7 bottom 
    ];
    CubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    CubeVertexPositionBuffer.itemSize = 3;
    CubeVertexPositionBuffer.numItems = 24;


    var texcoords = [
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,  0.0, 1.0, //v0, v1, v2, v3 front 
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,  0.0, 0.0, //v0, v3, v4, v5 right
        1.0, 1.0,   1.0, 0.0,   0.0, 0.0,  0.0, 1.0, // v4, v5, v6, v7 back
        0.0, 0.0,   0.0, 1.0,   1.0, 0.0,  1.0, 1.0, // v1, v2, v6, v7 left
        1.0, 0.0,   0.0, 0.0,   1.0, 1.0,  0.0, 1.0, // v0, v1, v5, v6 up 
        0.0, 1.0,   1.0, 1.0,   1.0, 0.0,  0.0, 0.0// v2, v3, v4, v7 bottom 
    ];
    CubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    CubeVertexTextureCoordBuffer.itemSize = 2;
    CubeVertexTextureCoordBuffer.numItems = 24;

    var normals = [
          0.0, 0.0, 1.0,    0.0, 0.0, 1.0,     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  //v0, v1, v2, v3 front 
          1.0, 0.0, 0.0,    1.0, 0.0, 0.0,     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  //v0, v3, v4, v5 right
          0.0, 0.0, -1.0,   0.0, 0.0, -1.0,    0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  // v4, v5, v6, v7 back
          -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, // v1, v2, v6, v7 left
          0.0, 1.0, 0.0,    0.0, 1.0, 0.0,     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0, v1, v5, v6 up
          0.0, -1.0, 0.0,   0.0, -1.0, 0.0,    0.0, -1.0, 0.0,  0.0, -1.0, 0.0,// v2, v3, v4, v7 bottom 
    ];
    CubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    CubeVertexNormalBuffer.itemSize = 3;
    CubeVertexNormalBuffer.numItems = 24;

    var indices = [
        0, 1, 2,        0, 2, 3, //front
        4, 5, 6,        4, 6, 7, //right
        8, 10, 9,       8, 11, 10, //back
        12, 14, 15,     12, 15, 13, //left
        16, 19, 18,     16, 17, 19, //up 
        // 16, 16, 16,     16, 16, 16,
        20, 23, 22,     20, 22, 21  //bottom
    ];
    CubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    CubeVertexIndexBuffer.itemSize = 1;
    CubeVertexIndexBuffer.numItems = 36;
}

function createCylinder(tRad, bRad, height, nSlice = 30, nStack = 1){
    var vertices = [];
    var indices = [];
    var normals = [];
    
    var aStep = Math.PI*2 / nSlice;
    var hStep = height / nStack;
    var rStep = (bRad - tRad) / nStack;

    // vertrices and normals 
    // side 
    for (var i = 0; i < nSlice; i++){
        var a = i * aStep;
        for (var j = 0; j <= nStack; j++){
            var h = j * hStep - height/2;
            var r = bRad - j * rStep; 
            vertices.push(r * Math.cos(a));
            vertices.push(h);
            vertices.push(r * Math.sin(a));

            normals.push(Math.cos(a));
            normals.push((tRad-bRad)/height);
            normals.push(Math.sin(a));
        }
    } 
    // bottom 
    for (var i=0; i < nSlice; i++){
        var a = i * aStep;
        vertices.push(r * Math.cos(a));
        vertices.push(-height/2);
        vertices.push(r * Math.sin(a));

        normals.push(0.0);
        normals.push(-1.0);
        normals.push(0.0);
    }
    // up
    for (var i=0; i < nSlice; i++){
        var a = i * aStep;
        vertices.push(r * Math.cos(a));
        vertices.push(height/2);
        vertices.push(r * Math.sin(a));

        normals.push(0.0);
        normals.push(1.0);
        normals.push(0.0);
    }


    CylinderVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    CylinderVertexPositionBuffer.itemSize = 3;
    CylinderVertexPositionBuffer.numItems = nSlice * (nStack+3);

    CylinderVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.STATIC_DRAW);
    CylinderVertexTextureCoordBuffer.itemSize = 2;
    CylinderVertexTextureCoordBuffer.numItems = 0;

    CylinderVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    CylinderVertexNormalBuffer.itemSize = 3;
    CylinderVertexNormalBuffer.numItems = nSlice * (nStack+3);

    // indices 
    // side
    for (var i = 0; i < nSlice; i++){
        var start = i * (nStack+1);
        var next = (i+1)%nSlice * (nStack+1);
 
        // side face
        for (var j = 0; j <= nStack; j++){
            indices.push(start+j, next+j, start+j+1);
            indices.push(start+j+1, next+j+1, next+j);
        }
    }

    // bottom 
    for (var i = 0; i < nSlice; i++){
        var origin = nSlice * (nStack+1);
        var start = nSlice * (nStack+1) + i;
        var next = nSlice * (nStack+1) + (i+1) % nSlice;
        indices.push(origin, start, next);
    }

    // up 
    for (var i = 0; i < nSlice; i++){
        var origin = nSlice * (nStack+2);
        var start = nSlice * (nStack+2) + i;
        var next = nSlice * (nStack+2) + (i+1) % nSlice;
        indices.push(origin, start, next);
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
    var normals = [];

    var height = 2 * rad;
    var aStep = Math.PI*2 / nSlice;
    var hStep = Math.PI / nStack;

    // vertices and colors
    vertices.push(0.0, -rad, 0.0);
    normals.push(0.0, -1.0, 0.0);
    for (var j = 1; j < nStack; j++){
        var h = -Math.PI/2 + hStep*j;
        for (var i = 0; i < nSlice; i++){
            var a = i * aStep;
            vertices.push(Math.cos(h) * Math.cos(a) * rad);
            vertices.push(Math.sin(h) * rad);
            vertices.push(Math.cos(h) * Math.sin(a) * rad);

            normals.push(Math.cos(h) * Math.cos(a));
            normals.push(Math.sin(h));
            normals.push(Math.cos(h) * Math.sin(a));
        }        
    }
    vertices.push(0.0, rad, 0.0);
    normals.push(0.0, 1.0, 0.0);

    SphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    SphereVertexPositionBuffer.itemSize = 3;
    SphereVertexPositionBuffer.numItems = nSlice * (nStack-1) + 2;

    SphereVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.STATIC_DRAW);
    SphereVertexTextureCoordBuffer.itemSize = 2;
    SphereVertexTextureCoordBuffer.numItems = 0;

    SphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    SphereVertexNormalBuffer.itemSize = 3;
    SphereVertexNormalBuffer.numItems = nSlice * (nStack-1) + 2;

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

///////////////////////////////////////////////////////
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

///////////////////////////////////////////////////////////////////////
var vMatrix = mat4.create();
var mMatrix = mat4.create();
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var nMatrix = mat4.create();
var v2wMatrix = mat4.create();  // eye space to world space matrix 
var third_vMatrix = mat4.create();
var first_vMatrix = mat4.create();

var yawMatrix = mat4.create();
var pitchMatrix = mat4.create();
var rollMatrix = mat4.create();
// Model to View 
mat4.lookAt([9,6,8], [0,0,0], [0,1,0], third_vMatrix);
mat4.lookAt([0,baseHeight+arm1Height+joint1Rad,baseRad], [0,baseHeight+arm1Height+joint1Rad,0], [0,1,0], first_vMatrix);
mat4.set(third_vMatrix, vMatrix);
var camera_mode = 3;

// View to Projection 
mat4.perspective(60, 1.0, 0.1, 100, pMatrix);

function setMatrixUniforms(){
    mat4.multiply(vMatrix, mMatrix, mvMatrix);
    mat4.inverse(mvMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix);
    mat4.inverse(vMatrix, v2wMatrix);

    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);
    gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);
}

function drawCube(){
    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexPositionBuffer);    // make the cube current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, CubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, CubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, CubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, CubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeVertexIndexBuffer);

    setMatrixUniforms();

    gl.uniform1i(shaderProgram.use_textureUniform, use_texture);
    gl.activeTexture(gl.TEXTURE0);    // set texture unit 0 to use 
    gl.bindTexture(gl.TEXTURE_2D, choosenTexture);   // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.textureUniform, 0);  // pass the texture unit to the shader

    gl.activeTexture(gl.TEXTURE1);  // set texture unit 1 to use
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.cubeMap_textureUniform, 1);  // pass the texture unit to the shader

    gl.drawElements(gl.TRIANGLES, CubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawCylinder(){
    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexPositionBuffer);    // make the cube current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, CylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, CylinderVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, CylinderVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, CylinderVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CylinderVertexIndexBuffer);

    setMatrixUniforms();

    gl.uniform1i(shaderProgram.use_textureUniform, use_texture);
    gl.activeTexture(gl.TEXTURE1);  // set texture unit 1 to use
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.cubeMap_textureUniform, 1);  // pass the texture unit to the shader

    gl.drawElements(gl.TRIANGLES, CylinderVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawSphere(){
    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexPositionBuffer);    // make the cube current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, SphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, SphereVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, SphereVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, SphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, SphereVertexIndexBuffer);
    
    setMatrixUniforms();

    gl.uniform1i(shaderProgram.use_textureUniform, use_texture);
    gl.activeTexture(gl.TEXTURE1);  // set texture unit 1 to use
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.cubeMap_textureUniform, 1);  // pass the texture unit to the shader

    gl.drawElements(gl.TRIANGLES, SphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawLoaded(){
    gl.bindBuffer(gl.ARRAY_BUFFER, robotVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, robotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, robotVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, robotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, robotVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, robotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, robotVertexIndexBuffer);

    setMatrixUniforms();

    gl.uniform1i(shaderProgram.use_textureUniform, use_texture);
    gl.activeTexture(gl.TEXTURE0);    // set texture unit 0 to use 
    gl.bindTexture(gl.TEXTURE_2D, choosenTexture);   // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.textureUniform, 0);  // pass the texture unit to the shader

    gl.activeTexture(gl.TEXTURE1);  // set texture unit 1 to use
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.cubeMap_textureUniform, 1);  // pass the texture unit to the shader

    gl.drawElements(gl.TRIANGLES, robotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawTeardrop(){
    gl.bindBuffer(gl.ARRAY_BUFFER, teardropVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teardropVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, teardropVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, teardropVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, teardropVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teardropVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teardropVertexIndexBuffer);

    setMatrixUniforms();

    gl.uniform1i(shaderProgram.use_textureUniform, use_texture);
    gl.activeTexture(gl.TEXTURE0);    // set texture unit 0 to use 
    gl.bindTexture(gl.TEXTURE_2D, choosenTexture);   // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.textureUniform, 0);  // pass the texture unit to the shader

    gl.activeTexture(gl.TEXTURE1);  // set texture unit 1 to use
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.cubeMap_textureUniform, 1);  // pass the texture unit to the shader

    gl.drawElements(gl.TRIANGLES, teardropVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


function setMaterial(){
    gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], mat_ambient[3]);
    gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], mat_diffuse[3]);
    gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], mat_specular[3]);
    gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shininess[0]);
}

///////////////////////////////////////////////////////////////////////
var now;
var g_last;
var elapsed;
var attackX;

function setupDrawScene() {
    if (robotVertexPositionBuffer == null || robotVertexTextureCoordBuffer == null
        || robotVertexNormalBuffer == null || robotVertexIndexBuffer == null){
        return;
    }

    if (textureLoaded < total_image)
        return;

    g_last = Date.now();
    attackX = 5.0;
    drawScene();
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viweportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var now = Date.now();
    var elapsed = (now - g_last) / 1000; // second
    g_last = now; 
    attackX = attackX - elapsed;
 
    // set up lighting 
    gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
    gl.uniform4f(shaderProgram.light_colorUniform, light_color[0], light_color[1], light_color[2], light_color[3]);
    
    // draw skybox 
    drawSkybox();
    drawLightSource();
    drawTank();
    drawAttack(attackX);

    // Call drawScene again next frame
    // requestAnimationFrame(drawScene);
}

function drawAttack(attackX){
    use_texture = 0;
    mat_ambient = [0.15, 0.15, 0.15, 1]; 
    mat_diffuse= [0.2, 0.2, 0.2, 1]; 
    mat_specular = [0.5, 0.5, 0.5, 1]; 
    mat_shininess = [20.0]; 
    setMaterial();
    choosenTexture = tearTexture;

    var a = 0.1;
    var attackY = a * attackX * attackX; 
    var dydx = a * 2 * attackX;
    var adjustAngle = Math.atan(dydx)

    mat4.identity(mMatrix); 
    mat4.translate(mMatrix, [left_incre, 0, front_incre], mMatrix);
    mat4.translate(mMatrix, [attackX, attackY-attack_base, 0], mMatrix);
    mat4.scale(mMatrix, [.3, .3, .3], mMatrix);
    mat4.rotate(mMatrix,  degToRad(90.0)+adjustAngle, [0, 0, 1], mMatrix);
    drawTeardrop();
}

function drawTank(){
    mat4.identity(mMatrix); 
    use_texture = 0;
    // global move
    mat4.translate(mMatrix, [left_incre, 0, front_incre], mMatrix);
    createCylinder(1, 1, 1);

    mat_ambient = [0, 0.15, 0, 1]; 
    mat_diffuse= [0.0, 0.2, 0, 1]; 
    mat_specular = [0.5, 0.5, 0.5, 1]; 
    mat_shininess = [50.0]; 
    setMaterial();

    pushMatrix(mMatrix);
      // car cube
      mat4.translate(mMatrix, [0, -carHeight/2, 0], mMatrix);
      pushMatrix(mMatrix);
        mat4.scale(mMatrix, [carWidth, carHeight, carLength], mMatrix);
        drawCube();
      mat4.set(popMatrix(), mMatrix); 

      //wheels cylinder
      // right side
      pushMatrix(mMatrix);
          mat4.translate(mMatrix, [carWidth/2-wheelHeight/2, -wheelRad-carHeight/2, -carLength/2-wheelRad], mMatrix);
          for (var i = 0; i < wheelCount; i++){
              mat4.translate(mMatrix, [0, 0, 2*wheelRad], mMatrix);
              pushMatrix(mMatrix);
                mat4.rotate(mMatrix, degToRad(90.0), [0,0,1], mMatrix);
                pushMatrix(mMatrix);
                  mat4.scale(mMatrix, [wheelRad, wheelHeight, wheelRad], mMatrix);
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
                  drawCylinder();
                mat4.set(popMatrix(), mMatrix);
              mat4.set(popMatrix(), mMatrix);
          }  
      mat4.set(popMatrix(), mMatrix); 

      // the ground 
      // pushMatrix(mMatrix); 
      //   mat4.translate(mMatrix, [0, -groundHeight/2-2*wheelRad-carHeight/2, 0], mMatrix);
      //   mat4.scale(mMatrix, [groundWidth, groundHeight, groundWidth], mMatrix);
      //   drawCube();
      // mat4.set(popMatrix(), mMatrix); 
    mat4.set(popMatrix(), mMatrix);

    // draw the loaded object  
    mat_ambient = [1, 1, 1, 1]; 
    mat_diffuse= [.8, .8, .8, 1]; 
    mat_specular = [.2, .2, .2, 1]; 
    mat_shininess = [50.0]; 
    setMaterial();
    use_texture = 1;
    choosenTexture = modelTexture;

    pushMatrix(mMatrix);
      mat4.translate(mMatrix, [0, -robot_base, carLength/2*279/280], mMatrix);
      mat4.rotate(mMatrix, degToRad(90.0), [0,1,0], mMatrix);
      drawLoaded();
    mat4.set(popMatrix(), mMatrix);

    mat_ambient = [0.0, 0.15, 0, 1]; 
    mat_diffuse= [0.0, 0.2, 0, 1]; 
    mat_specular = [0.5, 0.5, 0.5, 1]; 
    mat_shininess = [50.0]; 
    setMaterial(); 

    // cylinder base 
    use_texture = 0;
    mat4.translate(mMatrix, [0, baseHeight/2, 0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [baseRad, baseHeight, baseRad], mMatrix);
      drawCylinder();
    mat4.set(popMatrix(), mMatrix);

    // Arm1 Cube
    mat4.translate(mMatrix, [0, baseHeight/2+arm1Height/2, 0], mMatrix);
    mat4.rotate(mMatrix, degToRad(arm1Yangle), [0, 1, 0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [arm1Width, arm1Height, arm1Width], mMatrix);
      drawCube();
    mat4.set(popMatrix(), mMatrix);

    // Joint1 sphere
    mat4.translate(mMatrix, [0, arm1Height/2+joint1Rad/2, 0], mMatrix);
    mat4.rotate(mMatrix, degToRad(joint1Xangle), [1,0,0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [joint1Rad, joint1Rad, joint1Rad], mMatrix);
      drawSphere();
    mat4.set(popMatrix(), mMatrix); 

    // Arm2 Cube
    mat4.translate(mMatrix, [0, joint1Rad/2+arm2Height/2, 0], mMatrix);
    pushMatrix(mMatrix);
      mat4.scale(mMatrix, [arm2Width, arm2Height, arm2Width], mMatrix);
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
      drawCube();
    mat4.set(popMatrix(), mMatrix);
    
    // joint2 + Fingers
    mat4.translate(mMatrix, [0, palmHeight/2+joint2Rad, 0], mMatrix);
    for (var i = 0; i < fingerCount; i++){
        var dx = ((i+0.5) / fingerCount - 0.5) / 2;
        pushMatrix(mMatrix);
          //joint 2 - sphere
          mat4.translate(mMatrix, [dx, 0, 0], mMatrix);
          mat4.multiply(mMatrix, joint2Matrix, mMatrix);
          pushMatrix(mMatrix);
            mat4.scale(mMatrix, [joint2Rad, joint2Rad, joint2Rad], mMatrix);
            drawSphere();            
          mat4.set(popMatrix(), mMatrix);
          //finger - cone 
          mat4.translate(mMatrix, [0, joint2Rad/2+fingerHeight/2, 0], mMatrix);
          pushMatrix(mMatrix);
            mat4.scale(mMatrix, [fingerRad, fingerHeight, fingerRad], mMatrix);
            drawCylinder();
          mat4.set(popMatrix(), mMatrix);  
        mat4.set(popMatrix(), mMatrix);
    }    
}

function drawSkybox(){
    setMaterial();
    use_texture = 2;

    // posx
    mat4.identity(mMatrix);
    mat4.translate(mMatrix, [skyDis, 0, 0], mMatrix);
    mat4.scale(mMatrix, [1, 2*skyDis, 2*skyDis], mMatrix);
    choosenTexture = skyboxTexture_px;
    drawCube();

    // negx
    mat4.identity(mMatrix);
    mat4.translate(mMatrix, [-skyDis, 0, 0], mMatrix);
    mat4.scale(mMatrix, [1, 2*skyDis, 2*skyDis], mMatrix);
    choosenTexture = skyboxTexture_nx;
    drawCube();

    // posy 
    mat4.identity(mMatrix);
    mat4.translate(mMatrix, [0, skyDis, 0], mMatrix);
    mat4.scale(mMatrix, [2*skyDis, 1, 2*skyDis], mMatrix);
    choosenTexture = skyboxTexture_py;
    drawCube();

    // negy
    mat4.identity(mMatrix);
    mat4.translate(mMatrix, [0, -skyDis, 0], mMatrix);
    mat4.scale(mMatrix, [2*skyDis, 1, 2*skyDis], mMatrix);
    choosenTexture = skyboxTexture_ny;
    drawCube();

    // posz 
    mat4.identity(mMatrix);
    mat4.translate(mMatrix, [0, 0, skyDis], mMatrix);
    mat4.scale(mMatrix, [2*skyDis, 2*skyDis, 1], mMatrix);
    choosenTexture = skyboxTexture_pz;
    drawCube();

    // negz
    mat4.identity(mMatrix);
    mat4.translate(mMatrix, [0, 0, -skyDis], mMatrix);
    mat4.scale(mMatrix, [2*skyDis, 2*skyDis, 1], mMatrix);
    choosenTexture = skyboxTexture_nz;
    drawCube();
}

function drawLightSource(){
    mat4.identity(mMatrix); 
    use_texture = 0;
    mat_ambient = [1.0, 1.0, 1.0, 1]; 
    mat_diffuse= [0.0, 0.0, 0, 1]; 
    mat_specular = [.0, .0, .0, 1]; 
    mat_shininess = [0.0];
    setMaterial();

    pushMatrix(mMatrix);
      mat4.translate(mMatrix, [light_pos[0], light_pos[1], light_pos[2]], mMatrix);
      mat4.scale(mMatrix, [light_size, light_size, light_size]);
    // lower part: car + wheels e], mMatrix);
      drawSphere();
    mat4.set(popMatrix(), mMatrix); 
}

var matrixStack = [];
function pushMatrix(m){
    var m2 = mat4.create(m);
    matrixStack.push(m2);
}

function popMatrix(){
    return matrixStack.pop();
}

///////////////////////////////////////////////////////////////////////////
//
//  key stroke handler 
//
    function onKeyDown(event) {
      console.log(event.keyCode);
      switch(event.keyCode)  {
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
          case 73:
              console.log('enter I');
              light_pos[2] -= 0.03;
              drawScene();
              break;
          case 75:
              console.log('enter K');
              light_pos[2] += 0.03;
              drawScene();
              break;
          case 74:
              console.log('enter J');
              light_pos[0] -= 0.03;
              drawScene();
              break;
          case 76:
              console.log('enter L');
              light_pos[0] += 0.03;
              drawScene();
              break;
          case 85:
              console.log('enter U');
              light_pos[1] += 0.03;
              drawScene();
              break;
          case 79:
              console.log('enter O');
              light_pos[1] -= 0.03;
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
              console.log('enter right arrow key');
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
              if (joint2Zangle < 60.0) {
                joint2Zangle += angle_step;
                mat4.rotate(joint2Matrix, degToRad(angle_step), [0,0,1], joint2Matrix);
              }
              drawScene();
              break;
          case 86:
              console.log('enter V');
              if (joint2Zangle > -60.0){
                joint2Zangle -= angle_step;
                mat4.rotate(joint2Matrix, degToRad(-angle_step), [0,0,1], joint2Matrix);
              }
              drawScene();
              break;
          case 82: 
              mat4.identity(rollMatrix);
              if (event.shiftKey) {
                  console.log('enter R, clockwise');
                  mat4.rotate(rollMatrix, degToRad(-angle_step), [0, 0, 1], rollMatrix);                 
              }
              else {
                  console.log('enter r, counterclockwise');
                  mat4.rotate(rollMatrix, degToRad(angle_step), [0, 0, 1], rollMatrix);        
              }
              mat4.multiply(rollMatrix, vMatrix, vMatrix); 
              if (camera_mode == 1)
                  mat4.set(vMatrix, first_vMatrix);
              else 
                  mat4.set(vMatrix, third_vMatrix);
              drawScene();
              break;
          case 80:
              mat4.identity(pitchMatrix);
              if (event.shiftKey) {
                  console.log('enter P, look up');
                  mat4.rotate(pitchMatrix, degToRad(-angle_step/5), [1, 0, 0], pitchMatrix);
              } 
              else {
                  console.log('enter p, look down');
                  mat4.rotate(pitchMatrix, degToRad(angle_step/5), [1, 0, 0], pitchMatrix)
              } 
              mat4.multiply(pitchMatrix, vMatrix, vMatrix);
              if (camera_mode == 1)
                  mat4.set(vMatrix, first_vMatrix);
              else 
                  mat4.set(vMatrix, third_vMatrix);
              drawScene();
              break;
          case 89:
              mat4.identity(yawMatrix);
              if (event.shiftKey) {
                  console.log('enter Y, look left');
                  mat4.rotate(yawMatrix, degToRad(-angle_step/5), [0, 1, 0], yawMatrix);
              }  
              else {
                  console.log('enter y, look right');
                  mat4.rotate(yawMatrix, degToRad(angle_step/5), [0, 1, 0], yawMatrix);
              } 
              mat4.multiply(yawMatrix, vMatrix, vMatrix);
              if (camera_mode == 1)
                  mat4.set(vMatrix, first_vMatrix);
              else 
                  mat4.set(vMatrix, third_vMatrix);
              drawScene();
              break;
          case 49:
              console.log('enter 1, first person mode');
              mat4.set(first_vMatrix, vMatrix);
              camera_mode = 1;
              drawScene();
              break;
          case 51:
              console.log('enter 3, third person mode');
              mat4.set(third_vMatrix, vMatrix);
              camera_mode = 3;
              drawScene();
              break;
      }
}