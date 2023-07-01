export class Tile {
    constructor(i, e) {
        this.id = i;
        this.edge_count = e;
        this.tiles = [];
        this.corners = [];
        this.edges = [];
    }

    position_tile(n) {
        for (var i=0; i<this.edge_count; i++)
            if (this.tiles[i] == n)
                return i;
        return -1;
    }

    position_corner(c) {
        for (var i = 0; i < this.edge_count; i++)
        if (this.corners[i] == c)
            return i;
        return -1;
    }
}