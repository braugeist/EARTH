import { BoundingSphere, Cartesian3, Cartographic, Ellipsoid } from 'cesium';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { size_n_grid } from "../src/grid/grid.js";
import { tilePoints } from "../src/util.js";

const basePath = "../tmp/metadata/json/";
if (!existsSync(basePath)) {
    mkdirSync(basePath);
}

function computeCenter(points: number[]): Cartographic {
    var coords = Cartesian3.fromDegreesArray(points);
    var center = BoundingSphere.fromPoints(coords).center;
    Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
    var centerCartographic = Cartographic.fromCartesian(center);
    return centerCartographic;
}

function formatLatLng(lat: number, lng: number): string {
    const precision = 8;
    return `(${lat.toFixed(precision)}°N ${lng.toFixed(precision)}°E)`;
}

const g = size_n_grid(4);
for (var i = 0; i < g.tiles.length; i++) {
    const t = g.tiles[i];
    const points = tilePoints(t);
    let items = [];
    for (var j = 0; j < points.length; j += 2) {
        const lng = points[j] as number;
        const lat = points[j + 1] as number;
        items.push(formatLatLng(lat, lng));
    }
    const center = computeCenter(points);
    const description = `This is tile number ${i} of ${g.tiles.length} EARTH tiles. Its vertex coordinates are [${items.join(', ')}]. Its center is at ${formatLatLng(center.latitude, center.longitude)}.`;

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