import { BoundingSphere, Cartesian3, Cartographic, Color, ConstantPositionProperty, Ellipsoid, Entity, PolygonHierarchy, Viewer } from "cesium";
import { size_n_grid } from "./grid/grid";
import { computeCenter, tilePoints } from "./util";

export const ALPHA_SHAPE = 0.2;
export const ALPHA_SHAPE_OWNED = 0.01;
export const DEFAULT_SURFACE_COLOR = Color.BLACK.withAlpha(ALPHA_SHAPE_OWNED); // non-transparent for clickability
export const OUTLINE_COLOR = Color.BLACK.withAlpha(0.2);
export const OUTLINE_COLOR_SELECTED = Color.RED;

export interface TileEntity extends Entity {
  index: number;
  coordinates: number[];
  minted: boolean;
  message: string;
}

export function createGrid(viewer: Viewer): TileEntity[] {
  // Create grid.
  const g = size_n_grid(4);
  var tiles: TileEntity[] = [];
  for (var i = 0; i < g.tiles.length; i++) {
    const t = g.tiles[i];
    const points = tilePoints(t);
    const center = computeCenter(points);
    var poly = viewer.entities.add({
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(points)),
        height: 500,
        material: DEFAULT_SURFACE_COLOR,
        outline: true,
        outlineColor: OUTLINE_COLOR,
      },
      description: `Tile ${i}`,
      position: new ConstantPositionProperty(center),
    }) as TileEntity;
    poly.addProperty('index');
    poly.index = i;
    poly.coordinates = points;
    tiles.push(poly);
  }

  return tiles;
}