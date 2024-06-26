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
import { constants } from "ethers";
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

      // Display random tile.
      if (!parseUrlParams().get('tile')) {
        const owners = await earth.owners();
        // find owned tiles
        const selection = owners.map((owner, i) => owner != constants.AddressZero ? i : -1).filter(i => i != -1);
        if (selection.length > 0) {
          // display a random tile from the selection
          const i = selection[Math.floor(Math.random() * selection.length)];
          displayTile(i);
        } else {
          // display a random tile
          displayRandomTile();
        }
      }

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
  const urlParams = parseUrlParams();
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

function parseUrlParams() {
  const queryString = window.location.search;
  return new URLSearchParams(queryString);
}

function displayRandomTile() {
    // Select random tile.
    const numTiles = 812;
    const idx = Math.floor(Math.random() * numTiles);

    // Display tile.
    displayTile(idx);
}

function displayTile(idx: number) {
  const t = tiles[idx];
  viewer.selectedEntity = t;

  // Fly camera.
  viewer.flyTo(t, {offset: {
    heading: viewer.camera.heading,
    pitch: viewer.camera.pitch,
    range: viewer.camera.positionCartographic.height,
  }});
}
