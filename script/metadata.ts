import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { size_n_grid } from "../src/grid/grid.js";
import { tilePoints } from "../src/util.js";

const basePath = "../tmp/metadata/json/";
if (!existsSync(basePath)) {
    mkdirSync(basePath);
}

const g = size_n_grid(4);
for (var i = 0; i < g.tiles.length; i++) {
    const t = g.tiles[i];
    const points = tilePoints(t);
    const precision = 8;
    let items = [];
    for (var j = 0; j < points.length; j += 2) {
        const lng = (points[j] as Number).toFixed(precision);
        const lat = (points[j + 1] as Number).toFixed(precision);
        items.push(`(${lat}, ${lng})`);
    }
    const description = `This is one of ${g.tiles.length} EARTH tiles. Its coordinates are (Lat, Lng): [${items.join(', ')}]`;

    const d = {
        "name": `Tile ${i}`,
        "description": description,
        "external_url": `https://ownable.earth/?tile=${i}`,
        "image": `ipfs://QmckZx54qkufApdV499BJSyTDZTw6bxGGtJdgRNvk8iaM7/tile${i}.jpeg`,
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