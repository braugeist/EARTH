export class Corner {
    constructor(i) {
        this.id = i;
        this.tiles = [];
        this.corners = [];
        this.edges = [];
    }

    position (n) {
        for (var i=0; i<3; i++)
            if (this.corners[i] == n)
                return i;
        return -1;
    }
}