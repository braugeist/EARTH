import { writeFileSync } from 'fs';
import { size_n_grid } from "../src/grid/grid.js";
import { tilePoints } from "../src/util.js";

const basePath = "../data/metadata/";

const g = size_n_grid(4);
for (var i = 0; i < g.tiles.length; i++) {

    const t = g.tiles[i];
    const points = tilePoints(t);
    let lines = [];
    lines.push(`# EARTH Tile #${i}`);
    lines.push(``);
    lines.push('| Latitude | Longitude |');
    lines.push('| -------- | --------- |');
    for (var j = 0; j < points.length; j += 2) {
        const lng = points[j];
        const lat = points[j + 1];
        lines.push(`| ${lat} | ${lng} |`);
    }
    const description = lines.join('\n');

    const d = {
        "name": `Tile #${i}`,
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