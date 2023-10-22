// author: "nadeem@webscripts.biz"

var gl = ngl.get_gl();
ngl.configureDraw();
var verts = new Float32Array([
		-0.5,  0.5,  0.0, // top left
		-0.5, -0.5,  0.0, // bottom left
		 0.5, -0.5,  0.0, // bottom right
		 0.5,  0.5,  0.0, // top right
]);
var dim = 3;

ngl.loadAttribute("verts",verts,dim);

var indices = new Uint16Array([3,2,1 , 3,1,0]);
ngl.loadIndices(indices);
var indicesL = indices.length;

gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, indicesL, gl.UNSIGNED_SHORT, 0);


// var cnt = verts.length/dim;
// gl.drawArrays(gl.TRIANGLES, 0, cnt);
