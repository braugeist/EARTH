import { Color, ColorMaterialProperty, LabelGraphics, NearFarScalar, Viewer } from "cesium";
import { utils } from "ethers";
import { EARTH } from "./contract/type";
import { ALPHA_SHAPE, ALPHA_SHAPE_OWNED, TileEntity } from "./grid";

export async function paintTiles(viewer: Viewer, tiles: TileEntity[], earth: EARTH) {
  function refreshTile(t: TileEntity) {
    const color = Color.BLACK.withAlpha(t.transferred ? ALPHA_SHAPE_OWNED : ALPHA_SHAPE);
    t.polygon.material = new ColorMaterialProperty(color);

    const msg = t.message;
    if (msg != null) {
      t.label = new LabelGraphics({
        text: msg,
        scaleByDistance: new NearFarScalar(1.5e2, 1.0, 8.0e7, 0.001),
      });
    }
  }

  const transferred = await earth.transferredAll();
  transferred.forEach((b: boolean, i: number) => {
    tiles[i].transferred = b;
  });
  const messages = await earth.customDataAll();
  messages.forEach((customData: string, i: number) => {
    tiles[i].message = utils.toUtf8String(customData);
  });
  tiles.forEach(t => refreshTile(t));
  viewer.scene.requestRender();

  const transfer = earth.filters.Transfer();
  earth.on(transfer, (_from, _to, index) => {
    const t = tiles[index.toNumber()];
    t.transferred = true;
    refreshTile(t);
    viewer.scene.requestRender();
  });

  const customDataChanged = earth.filters.CustomDataChanged();
  earth.on(customDataChanged, async index => {
    const t = tiles[index.toNumber()];
    const customData = await earth.customData(index);
    t.message = utils.toUtf8String(customData);
    refreshTile(t);
    viewer.scene.requestRender();
  });
}