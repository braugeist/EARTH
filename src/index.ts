import "cesium/Build/Cesium/Widgets/widgets.css";
import "cesium/Build/Cesium/Widgets/InfoBox/InfoBoxDescription.css";
import "./css/main.css";
import { createViewer } from "./viewer";
import { createGrid, OUTLINE_COLOR_SELECTED } from "./grid";
import { initWeb3 } from "./web3";
import { initToolbar } from "./ui/toolbar";
import { paintTiles } from "./paint";
import { initTileModal } from "./ui/tile";
import { enableErrorHandling } from "./util";

enableErrorHandling();

const viewer = createViewer();
const tiles = createGrid(viewer);

import { enableSnap } from "./snap";
import { ConstantProperty } from "cesium";
enableSnap(viewer, tiles);

function showConnectModal() {
  const connectModal = document.getElementById('connect-modal');
  connectModal.style.display = 'table';
  const connect = document.getElementById('connect-modal-button-connect') as HTMLButtonElement;
  connect.onclick = async e => {
    connect.disabled = true;

    // Init Web3 functionality.
    const [earth, land] = await initWeb3();

    await Promise.all([
      initToolbar(land), // Init toolbar.
      initTileModal(viewer, tiles, earth, land), // Initialize tile modal.
      paintTiles(viewer, tiles, earth), // Paint tiles according to ownership.
    ]);

    connectModal.style.display = 'none';
  };
}

showConnectModal();

function parseQueryParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const tileParam = urlParams.get('tile');
  if (tileParam) {
    const i = parseInt(tileParam);
    const t = tiles[i];

    // Fly camera.
    viewer.flyTo(t, {offset: {
      heading: viewer.camera.heading,
      pitch: viewer.camera.pitch,
      range: viewer.camera.positionCartographic.height,
    }});
    
    // Set color.
    t.polygon.outlineColor = new ConstantProperty(OUTLINE_COLOR_SELECTED);
    viewer.scene.requestRender();
  }
}

parseQueryParams();
