// author: "nadeem@webscripts.biz"
"use strict"; 
var ngl = new function (){
	var canvas = document.body.children[0];
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	this.get_cw = function(){ return canvas.width; };
	this.get_ch = function(){ return canvas.height; };

	var gl = canvas.getContext('webgl');
	if(!gl) { console.log("no gl support"); return; }

	this.get_gl = function(){
		return gl;
	};

	var vshdr = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vshdr
		, document.getElementById('vertex-shader-2d').text
	);
	gl.compileShader(vshdr);

	var fshdr = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fshdr 
		, document.getElementById('fragment-shader-2d').text
	);
	gl.compileShader(fshdr);

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram,vshdr); 
	gl.attachShader(shaderProgram,fshdr);
	gl.linkProgram(shaderProgram);
	gl.useProgram(shaderProgram);

	this.get_shaderProgram = function(){
		return shaderProgram;
	};

	this.loadIndices = function(indices){
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer() );
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	};

	this.loadAttribute = function(vertsName, verts, dim){
		// transfer data to gpu
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer() );
		gl.bufferData(gl.ARRAY_BUFFER , verts , gl.STATIC_DRAW);

		// ---------point attribute location
		var ptr = gl.getAttribLocation(shaderProgram, vertsName);

		gl.vertexAttribPointer(ptr
			, dim 
			, gl.FLOAT,false,0,0
		);
		gl.enableVertexAttribArray(ptr);

		// unbind
		gl.bindBuffer(gl.ARRAY_BUFFER,null);

	};
	this.loadUniform4f= function(name,r,g,b,a){
		var ptr = gl.getUniformLocation( shaderProgram, name );
		gl.uniform4f(ptr,r,g,b,a);
	};
	this.loadUniform2f= function(name,x,y){
		var ptr = gl.getUniformLocation( shaderProgram, name );
		gl.uniform2f(ptr,x,y);
	};
	this.loadUniform1f = function(name,i){
		var ptr = gl.getUniformLocation( shaderProgram, name );
		gl.uniform1f(ptr,i);
	};
	this.loadUniformMatrix4fv = function(name, mat4){
		var ptr = gl.getUniformLocation ( shaderProgram, name );
		gl.uniformMatrix4fv(ptr, false, mat4 );
	};

	this.loadImageTexture = function(image){
		// Create a texture.
		gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());

		// Set the parameters so we can render any size image.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		//gl.bindTexture(gl.TEXTURE_2D, null);// DO NOT UNBIND 
	};
	this.loadDataTexture = function(pixeldata, width, height){
		// Create a texture.
		gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 
			0,                 // level
			gl.RGBA,           // internal format
			width,                 // width
			height,                 // height
			0,                 // border
			gl.RGBA,           // format
			gl.UNSIGNED_BYTE,  // type
			pixels,            // data
		);


		//gl.bindTexture(gl.TEXTURE_2D, null);// DO NOT UNBIND 
	};
	this.configureDraw = function(){
		gl.clearColor(0.1, 0.1, 0.1, 1.0);
		gl.enable(gl.DEPTH_TEST); 
		gl.viewport(0,0,canvas.width,canvas.height);
	};
};
// ned vertex generator
var nvg = {
	genVerts4imageQuad : function(x,y,w,h){
		return new Float32Array ( [
			x     ,	y     , // bottom left
			x + w ,	y     , // bottom right
			x + w ,	y + h , // top right

			x     ,	y     , // bottom left
			x + w ,	y + h , // top right
			x     ,	y + h   // top left
		]  );                               
	},

	// top left is 0,0
	genImageQuad : function(){
		return new Float32Array([   
			0.0,  1.0, // bottom left
			1.0,  1.0, // bottom right
			1.0,  0.0, // top right

			0.0,  1.0, // bottom left
			1.0,  0.0, // top right
			0.0,  0.0, // top left
		]);
	},

	// COLUMN MAJOR MATRIX LAYOUT CONVENTION REQUIRED
	genTranslationMatrix : function(tx,ty,tz){
		return new Float32Array ( [
			1.0 , 0.0 , 0.0 , 0.0 ,
			0.0 , 1.0 , 0.0 , 0.0 ,
			0.0 , 0.0 , 1.0 , 0.0 ,
			tx  , ty  , tz  , 1.0
		] ) ;
	},

	genScaleMatrix : function(sx,sy,sz){
		return new Float32Array ( [
			sx  , 0.0 , 0.0 , 0.0 ,
			0.0 , sy  , 0.0 , 0.0 ,
			0.0 , 0.0 , sz  , 0.0 ,
			0.0 , 0.0 , 0.0 , 1.0
		] ) ;
	},

	calcCOS : function(degrees){
		return Math.cos(degrees*3.1416/180);
	},

	calcSIN : function(degrees){
		return Math.sin(degrees*3.1416/180);
	},


	genIdentityMatrix : function(){
		return new Float32Array ( [
			1.0  ,  0.0  ,  0.0  ,  0.0  ,
			0.0  ,  1.0  ,  0.0  ,  0.0  ,
			0.0  ,  0.0  ,  1.0  ,  0.0  ,
			0.0  ,  0.0  ,  0.0  ,  1.0
		] ) ;
	},

	// COLUMN MAJOR MATRIX LAYOUT CONVENTION REQUIRED
	genRotateAboutXmatrix : function(degrees){

		var cos = this.calcCOS(degrees);
		var sin = this.calcSIN(degrees);

		return new Float32Array ( [
			1.0  ,  0.0  ,  0.0  ,  0.0  ,
			0.0  ,  cos  ,  sin  ,  0.0  ,
			0.0  , -sin  ,  cos  ,  0.0  ,
			0.0  ,  0.0  ,  0.0  ,  1.0
		] ) ;
	},

	genRotateAboutYmatrix : function(degrees){

		var cos = this.calcCOS(degrees);
		var sin = this.calcSIN(degrees);

		return new Float32Array ( [
			cos  ,  0.0  , -sin  ,  0.0  ,
			0.0  ,  1.0  ,  0.0  ,  0.0  ,
			sin  ,  0.0  ,  cos  ,  0.0  ,
			0.0  ,  0.0  ,  0.0  ,  1.0
		] ) ;
	},

	genRotateAboutZmatrix : function(degrees){

		var cos = this.calcCOS(degrees);
		var sin = this.calcSIN(degrees);

		return new Float32Array ( [
			cos  ,  sin  ,  0.0  ,  0.0  ,
			-sin  ,  cos  ,  0.0  ,  0.0  ,
			0.0  ,  0.0  ,  1.0  ,  0.0  ,
			0.0  ,  0.0  ,  0.0  ,  1.0
		] ) ;
	}
};
