import { Color, ColorMaterialProperty, Viewer } from "cesium";
import { EARTH } from "./contract/type";
import { ALPHA_SHAPE, ALPHA_SHAPE_OWNED, TileEntity } from "./grid";

export async function paintTiles(viewer: Viewer, tiles: TileEntity[], earth: EARTH) {
  function paintTile(index: number, owned: boolean) {
    const color = Color.BLACK.withAlpha(owned ? ALPHA_SHAPE_OWNED : ALPHA_SHAPE);
    tiles[index].polygon.material = new ColorMaterialProperty(color);
  }

  const transferred = await earth.transferredAll();
  transferred.forEach((b: boolean, i: number) => {
    paintTile(i, b);
  });
  viewer.scene.requestRender();
}