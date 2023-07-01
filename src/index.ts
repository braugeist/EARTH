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
  // If window.ethereum unavailable, disable option.
  if ((window as any).ethereum === undefined) {
    // Disable window.Ethereum option.
    const optionPlugin = document.getElementById('connector-browserextension') as HTMLInputElement;
    optionPlugin.disabled = true;
    // Ensure fallback option checked.
    const optionFallback = document.getElementById('connector-infura') as HTMLInputElement;
    optionFallback.checked = true;
  }

  const connectModal = document.getElementById('connect-modal');
  connectModal.style.display = 'table';
  const connect = document.getElementById('connect-modal-button-connect') as HTMLButtonElement;
  connect.onclick = async e => {
    connect.disabled = true;

    // Init Web3 functionality.
    try {
      const earth = await initWeb3();
      
      await Promise.all([
        initToolbar(), // Init toolbar.
        initTileModal(viewer, tiles, earth), // Initialize tile modal.
        paintTiles(viewer, tiles, earth), // Paint tiles according to ownership.
      ]);

      connectModal.style.display = 'none';
    } catch (err) {
      document.getElementById('connect-modal-status').style.display = 'none';
      connect.disabled = false;
      throw err;
    }
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
