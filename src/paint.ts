import { Color, ColorMaterialProperty, Viewer } from "cesium";
import { EARTH } from "./contract/type";
import { ALPHA_SHAPE, ALPHA_SHAPE_OWNED, TileEntity } from "./grid";
import { ZERO_ADDRESS } from "./util";

export async function paintTiles(viewer: Viewer, tiles: TileEntity[], earth: EARTH) {
  function paintTile(index: number, owned: boolean) {
    const color = Color.BLACK.withAlpha(owned ? ALPHA_SHAPE_OWNED : ALPHA_SHAPE);
    tiles[index].polygon.material = new ColorMaterialProperty(color);
  }

  const owners = await earth.owners();
  owners.forEach((owner, i) => {
    const owned = owner != ZERO_ADDRESS;
    paintTile(i, owned);
  });
  viewer.scene.requestRender();
}