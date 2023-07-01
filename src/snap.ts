import { Color, ColorMaterialProperty, Viewer } from "cesium";
import { ALPHA_SHAPE, ALPHA_SHAPE_OWNED, TileEntity } from "./grid";

export function enableSnap(viewer: Viewer, tiles: TileEntity[]) {
    (window as any).snapTile = async function (i: number, callback: any) {
        tiles.forEach((t, j) => paintTile(t, i == j));
        const height = 12673565 * 0.64;
        const offset = {
            heading: viewer.camera.heading,
            pitch: viewer.camera.pitch,
            range: height,
        };
        await viewer.zoomTo(tiles[i], offset);

        const globe = viewer.scene.globe;
        let remove = globe.tileLoadProgressEvent.addEventListener(
            queuedTileCount => {
                if(globe.tilesLoaded){
                    remove();
                    viewer.render();
                    callback(viewer.canvas.toDataURL('image/jpeg'));
                }
            }
        );
        setTimeout(() => globe.tileLoadProgressEvent.raiseEvent(), 100);
    };
}

function paintTile(t: TileEntity, owned: boolean) {
    const color = Color.BLACK.withAlpha(owned ? ALPHA_SHAPE_OWNED : ALPHA_SHAPE);
    t.polygon.material = new ColorMaterialProperty(color);
}
