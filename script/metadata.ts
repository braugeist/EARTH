import { writeFileSync } from 'fs';
import { size_n_grid } from "../src/grid/grid.js";
import { tilePoints } from "../src/util.js";

const basePath = "../data/metadata/";

const g = size_n_grid(4);
for (var i = 0; i < g.tiles.length; i++) {
    const t = g.tiles[i];
    const points = tilePoints(t);
    const d = {
        "description": `Tile #${i} of EARTH`,
        "external_url": `https://ownable.earth/tile/${i}`,
        "image": `https://ownable.earth/image/${i}.png`,
        "name": `Tile #${i}`,
        "attributes": [
            {
                "trait_type": "Vertex Count",
                "display_type": "number",
                "value": points.length / 2
            },
            {
                "trait_type": "Vertices (Lat,Lng)",
                "value": points.toString() //TODO create proper string
            }
        ]
    };
    const fn = basePath + i;
    const data = JSON.stringify(d, null, 2);
    writeFileSync(fn, data);
}