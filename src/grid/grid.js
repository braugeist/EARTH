import { Tile } from "./tile.js";
import { Corner } from "./corner.js";
import { Edge } from "./edge.js";

class Grid {
    constructor(s) {
        this.size = s;

        this.tiles = [];
        for (var i = 0; i < tile_count(this.size); i++)
            this.tiles.push(new Tile(i, i < 12 ? 5 : 6));

        this.corners = [];
        for (var i = 0; i < corner_count(this.size); i++)
            this.corners.push(new Corner(i));

        this.edges = [];
        for (var i = 0; i < edge_count(this.size); i++)
            this.edges.push(new Edge(i));
    }
}

function tile_count(size) { return 10 * Math.pow(3, size) + 2; }
function corner_count(size) { return 20 * Math.pow(3, size); }
function edge_count(size) { return 30 * Math.pow(3, size); }

export function size_n_grid(size) {
	if (size == 0) {
		return size_0_grid();
	}
	else {
		return _subdivided_grid(size_n_grid(size-1));
	}
}

function size_0_grid() {
    var grid = new Grid(0);
    const x = -0.525731112119133606;
	const z = -0.850650808352039932;
	
	const icos_tiles = [
		[-x, 0, z], [x, 0, z], [-x, 0, -z], [x, 0, -z],
		[0, z, x], [0, z, -x], [0, -z, x], [0, -z, -x],
		[z, x, 0], [-z, x, 0], [z, -x, 0], [-z, -x, 0]
    ];

    const icos_tiles_n = [
		[9, 4, 1, 6, 11], [4, 8, 10, 6, 0], [11, 7, 3, 5, 9], [2, 7, 10, 8, 5],
		[9, 5, 8, 1, 0], [2, 3, 8, 4, 9], [0, 1, 10, 7, 11], [11, 6, 10, 3, 2],
		[5, 3, 10, 1, 4], [2, 5, 4, 0, 11], [3, 7, 6, 1, 8], [7, 2, 9, 0, 6]
	];

    // Add tiles.
    for (var i=0; i < grid.tiles.length; i++) {
        var t = grid.tiles[i];
		t.v = icos_tiles[t.id];
		for (var k=0; k<5; k++) {
			t.tiles[k] = grid.tiles[icos_tiles_n[t.id][k]];
		}
	}
	for (var i=0; i<5; i++) {
		_add_corner(i, grid, 0, icos_tiles_n[0][(i+4)%5], icos_tiles_n[0][i]);
	}
	for (var i=0; i<5; i++) {
		_add_corner(i+5, grid, 3, icos_tiles_n[3][(i+4)%5], icos_tiles_n[3][i]);
	}
	_add_corner(10,grid,10,1,8);
	_add_corner(11,grid,1,10,6);
	_add_corner(12,grid,6,10,7);
	_add_corner(13,grid,6,7,11);
	_add_corner(14,grid,11,7,2);
	_add_corner(15,grid,11,2,9);
	_add_corner(16,grid,9,2,5);
	_add_corner(17,grid,9,5,4);
	_add_corner(18,grid,4,5,8);
	_add_corner(19,grid,4,8,1);

	//_add corners to corners
	for (var i=0; i<grid.corners.length; i++) {
        var c = grid.corners[i];
		for (var k=0; k<3; k++) {
			c.corners[k] = c.tiles[k].corners[(c.tiles[k].position_corner(c)+1)%5];
		}
	}
	//new edges
	var next_edge_id = 0;
	for (var i=0; i<grid.tiles.length; i++) {
		for (var k=0; k<5; k++) {
			if (t.edges[k] == undefined) {
				_add_edge(next_edge_id, grid, t.id, icos_tiles_n[t.id][k]);
				next_edge_id++;
			}
		}
	}

    return grid;
}

function _subdivided_grid(prev) {
	var grid = new Grid(prev.size + 1);

	const prev_tile_count = prev.tiles.length;
	const prev_corner_count = prev.corners.length;
	
	//old tiles
	for (var i=0; i<prev_tile_count; i++) {
		grid.tiles[i].v = prev.tiles[i].v;
		for (var k=0; k<grid.tiles[i].edge_count; k++) {
			grid.tiles[i].tiles[k] = grid.tiles[prev.tiles[i].corners[k].id+prev_tile_count];
		}
	}
	//old corners become tiles
	for (var i=0; i<prev_corner_count; i++) {
		grid.tiles[i+prev_tile_count].v = prev.corners[i].v;
		for (var k=0; k<3; k++) {
			grid.tiles[i+prev_tile_count].tiles[2*k] = grid.tiles[prev.corners[i].corners[k].id+prev_tile_count];
			grid.tiles[i+prev_tile_count].tiles[2*k+1] = grid.tiles[prev.corners[i].tiles[k].id];
		}
	}
	//new corners
	var next_corner_id = 0;
	for (var i=0; i<prev.tiles.length; i++) {
        const n = prev.tiles[i];
		const t = grid.tiles[n.id];
		for (var k=0; k<t.edge_count; k++) {
			_add_corner(next_corner_id, grid, t.id, t.tiles[(k+t.edge_count-1)%t.edge_count].id, t.tiles[k].id);
			next_corner_id++;
		}
	}
	//connect corners
	for (var i=0; i<grid.corners.length; i++) {
        var c = grid.corners[i];
		for (var k=0; k<3; k++) {
			c.corners[k] = c.tiles[k].corners[(c.tiles[k].position_corner(c)+1)%(c.tiles[k].edge_count)];
		}
	}
	//new edges
	var next_edge_id = 0;
	for (var i=0; i<grid.tiles.length; i++) {
        var t = grid.tiles[i];
		for (var k=0; k<t.edge_count; k++) {
			if (t.edges[k] == undefined) {
				_add_edge(next_edge_id, grid, t.id, t.tiles[k].id);
				next_edge_id++;
			}
		}
	}
	
	return grid;
}

function _add_corner(id, grid, t1, t2, t3) {
	var c = grid.corners[id];
	var t = [grid.tiles[t1], grid.tiles[t2], grid.tiles[t3]];
	var v = add(add(t[0].v, t[1].v), t[2].v);
	c.v = normal(v);
	for (var i=0; i<3; i++) {
		t[i].corners[t[i].position_tile(t[(i+2)%3])] = c;
		c.tiles[i] = t[i];
	}
}

function _add_edge(id, grid, t1, t2) {
	var e = grid.edges[id];
	var t = [grid.tiles[t1], grid.tiles[t2]];
	var c = [
		grid.corners[t[0].corners[t[0].position_tile(t[1])].id],
		grid.corners[t[0].corners[(t[0].position_tile(t[1])+1)%t[0].edge_count].id],
    ];
	for (var i=0; i<2; i++) {
		t[i].edges[t[i].position_tile(t[(i+1)%2])] = e;
		e.tiles[i] = t[i];
		c[i].edges[c[i].position(c[(i+1)%2])] = e;
		e.corners[i] = c[i];
	}
}

function add(v, w) {
    return [v[0]+w[0], v[1]+w[1], v[2]+w[2]];
}

function mult(v, d) {
    return [v[0]*d, v[1]*d, v[2]*d];
}

function normal(v) {
    const d = 1.0 / length(v);
	return mult(v, d);
}

function length(v) {
    return Math.sqrt(squared_length(v));
}

function squared_length(v) {
	return v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
}
