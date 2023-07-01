import "cesium/Widgets/widgets.css";
import "cesium/Widgets/InfoBox/InfoBoxDescription.css";
import "./css/main.css";
import { createViewer } from "./viewer";
import { createGrid } from "./grid";
import { initWeb3 } from "./web3";
import { initToolbar } from "./ui/toolbar";
import { paintTiles } from "./paint";
import { initTileModal } from "./ui/tile";
import { enableErrorHandling } from "./util";

enableErrorHandling();

const viewer = createViewer();
const tiles = createGrid(viewer);

import { enableSnap } from "./snap";
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
