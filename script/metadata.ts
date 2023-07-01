import { writeFileSync } from 'fs';
import { size_n_grid } from "../src/grid/grid.js";
import { tilePoints } from "../src/util.js";

const basePath = "../data/metadata/";

const g = size_n_grid(4);
for (var i = 0; i < g.tiles.length; i++) {
    const t = g.tiles[i];
    const points = tilePoints(t);
    const d = {
        "name": `Tile #${i}`,
        "description": `EARTH tile #${i}. Coordinates ${points}.`, //TODO create proper string / markdown
        "external_url": `https://ownable.earth/?tile=${i}`,
        "image": `https://ownable.earth/image/${i}.png`,
        "attributes": [
            {
                "trait_type": "Shape",
                "value": (points.length / 2) == 5 ? "Pentagon" : "Hexagon",
            },
        ]
    };
    const fn = basePath + i;
    const data = JSON.stringify(d, null, 2);
    writeFileSync(fn, data);
}