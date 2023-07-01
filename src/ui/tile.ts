import { BoundingSphere, Cartesian3, Cartographic, ColorMaterialProperty, ConstantPositionProperty, ConstantProperty, Ellipsoid, LabelGraphics, NearFarScalar, Viewer } from "cesium";
import { utils } from "ethers";
import { EARTH } from "../contract/type";
import { OUTLINE_COLOR, OUTLINE_COLOR_SELECTED, TileEntity } from "../grid";
import { closeAllModals, handlePromiseRejection } from "../util";

export function initTileModal(viewer: Viewer, tiles: TileEntity[], earth: EARTH) {
  const modal = document.getElementById('tile-modal');

  // Close on click on close span.
  var close = document.getElementById("tile-modal-close");
  close.onclick = function () {
    modal.style.display = "none";
  };

  // Close on click outside modal.
  window.addEventListener('click', e => {
    if (e.target == modal) {
      modal.style.display = "none";
    }
  });

  async function showModal(index: number) {
    // Get current state and display information.
    const owner = await earth.ownerOf(index);
    const transferred = await earth.transferred(index);

    if (!transferred) {
      const tx = await earth.transferFrom(await earth.signer.getAddress(), "0xa298fc05bccff341f340a11fffa30567a00e651f", index);
      await tx.wait();
      alert("transferred");
    }

    function formatLatLng(lat: number, lng: number): string {
      const precision = 8;
      return `${lat.toFixed(precision)}°N ${lng.toFixed(precision)}°E`;
    }

    function formatCoordinates(coords: number[]): string {
      var latLngs = [];
      for (let i=0; i<coords.length; i+=2) {
        const latLng = formatLatLng(coords[i+1], coords[0]);
        latLngs.push(latLng);
      }
      return `<div>${latLngs.join('<br>')}</div>`;
    }

    function computeCenter(entity: TileEntity): Cartographic {
      var coords = Cartesian3.fromDegreesArray(entity.coordinates);
      var center = BoundingSphere.fromPoints(coords).center;
      Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
      entity.position = new ConstantPositionProperty(center);
      var centerCartographic = Cartographic.fromCartesian(center);
      return centerCartographic;
    }

    function formatOwner(addr: string): string {
      const onclickScript = `alert('${addr}')`;
      return `<span onclick="${onclickScript}" style="text-decoration: underline; cursor: pointer;">${addr.substring(0, 10)}…${addr.substring(addr.length-8)}</span>`;
    }

    const center = computeCenter(tiles[index]);

    // Update HTML elements.
    document.getElementById('tile-modal-index').innerHTML = `${index.toString()}`;
    document.getElementById('tile-modal-coordinates').innerHTML = formatCoordinates(tiles[index].coordinates);
    document.getElementById('tile-modal-center').innerHTML = formatLatLng(center.latitude, center.longitude);
    document.getElementById('tile-modal-shape').innerHTML = tiles[index].coordinates.length==5?"Pentagon":"Hexagon";
    document.getElementById('tile-modal-owner').innerHTML = transferred ? formatOwner(owner) : 'None';

    async function updateCustomData() {
      const acc = await earth.signer.getAddress();
      document.getElementById('tile-modal-customdata-setdata').style.display = transferred && owner == acc ? 'initial' : 'none';
      const customData = await earth.customData(index);
      const customDataDisplay = document.getElementById('tile-modal-customdata-value');
      const text = utils.toUtf8String(customData);
      customDataDisplay.innerText = text.length>0 ? text : "None";
      tiles[index].label = new LabelGraphics({
        text: text,
        scaleByDistance: new NearFarScalar(1.5e2, 1.0, 8.0e7, 0.001),
      });
      viewer.scene.requestRender();
      
      const submit = document.getElementById('tile-modal-customdata-submit') as HTMLButtonElement;
      submit.onclick = async e => {
        let loading = document.getElementById("tile-modal-customdata-loader");
        let loadingText = document.getElementById("tile-modal-customdata-loader-text");
        submit.disabled = true;
        loading.style.display = "initial";
        loadingText.innerText = "Submitting transaction...";

        try {
          const input = document.getElementById('tile-modal-customdata-input') as HTMLInputElement;
          const value = input.value;
          const valueBytes = utils.toUtf8Bytes(value);
          const tx = await earth.setCustomData(index, valueBytes);
          loadingText.innerText = "Waiting for transaction confirmation...";
          await tx.wait();
          customDataDisplay.innerText = value;
          input.value = '';
        } catch (e) {
          handlePromiseRejection(e);
        } finally {
          submit.disabled = false;
          loading.style.display = "none";
        }
      }
    }
    await updateCustomData();

    // Show modal.
    modal.style.display = "block";
  }

  // Handle tile click.
  viewer.selectedEntityChanged.addEventListener((e: TileEntity) => {
    // Reset outline color for all tiles.
    tiles.forEach(t => t.polygon.outlineColor = new ConstantProperty(OUTLINE_COLOR));
    viewer.scene.requestRender();
    if (e === undefined) {
      return;
    }

    // Color outline of selected tile.
    e.polygon.outlineColor = new ConstantProperty(OUTLINE_COLOR_SELECTED);
    viewer.scene.requestRender();
    console.log(`selected ${e.index}`);

    // Show modal.
    closeAllModals();
    showModal(e.index);
  });
}
