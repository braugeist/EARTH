import { Cartographic, ConstantProperty, Math, Viewer } from "cesium";
import { constants, utils } from "ethers";
import { EARTH_sol_EARTH as EARTH } from "../contract/type";
import { OUTLINE_COLOR, OUTLINE_COLOR_SELECTED, TileEntity } from "../grid";
import { closeAllModals, handlePromiseRejection, showAlertModal } from "../util";

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

  async function updateModal(index: number) {
    // Get current state and display information.
    const owner = await earth.ownerOfOrZero(index);
    const minted = owner != constants.AddressZero;

    const uri = await earth.tokenURI(index);
    const header_len = "data:application/json;base64,".length;
    const text = window.atob(uri.substring(header_len));
    console.log(text);

    function formatLatLng(lat: number, lng: number): string {
      const precision = 3;
      const latDeg = (() => {
        const latDeg = Math.toDegrees(lat);
        if (latDeg >= 0) {
          return `${latDeg.toFixed(precision)}°N`
        } else {
          return `${(latDeg * -1).toFixed(precision)}°S`
        }
      })();
      const lngDeg = (() => {
        const lngDeg = Math.toDegrees(lng);
        if (lngDeg >= 0) {
          return `${lngDeg.toFixed(precision)}°E`
        } else {
          return `${(lngDeg * -1).toFixed(precision)}°W`
        }
      })();
      return `${latDeg} ${lngDeg}`;
    }

    function formatCoordinates(coords: number[]): string {
      var latLngs = [];
      for (let i=0; i<coords.length; i+=2) {
        const latLng = formatLatLng(coords[i+1], coords[0]);
        latLngs.push(latLng);
      }
      return `<div>${latLngs.join('<br>')}</div>`;
    }

    function formatOwner(addr: string): string {
      const ownerDisplay = document.getElementById('tile-modal-owner')
      ownerDisplay.onclick = () => {
        ownerDisplay.innerText = addr;
        ownerDisplay.onclick = null;
      }
      return `${addr.substring(0, 10)}…${addr.substring(addr.length-8)}`;
    }

    const pos = tiles[index].position.getValue(viewer.clock.currentTime);
    const center = Cartographic.fromCartesian(pos);

    // Update HTML elements.
    document.getElementById('tile-modal-index').innerHTML = `${index.toString()}`;
    document.getElementById('tile-modal-coordinates').innerHTML = formatCoordinates(tiles[index].coordinates);
    document.getElementById('tile-modal-center').innerHTML = formatLatLng(center.latitude, center.longitude);
    document.getElementById('tile-modal-shape').innerHTML = tiles[index].coordinates.length==5?"Pentagon":"Hexagon";
    document.getElementById('tile-modal-owner').innerHTML = minted ? formatOwner(owner) : 'none';
    document.getElementById('tile-modal-mint').style.display = minted ? 'none' : 'initial';

    // Update message.
    {
      const owned = earth.signer && owner == await earth.signer.getAddress();
      document.getElementById('tile-modal-customdata-setdata').style.display = owned ? 'initial' : 'none';
      const customData = await earth.customData(index);
      const customDataDisplay = document.getElementById('tile-modal-customdata-value');
      const text = utils.toUtf8String(customData);
      customDataDisplay.innerText = text.length>0 ? text : "none";
    }
  }

  // Register event listener for minting.
  const transfer = earth.filters.Transfer();
  earth.on(transfer, (_from, _to, index) => {
    const modalIndex = parseInt(document.getElementById('tile-modal-index').innerHTML);
    if (modalIndex === Number(index)) {
      updateModal(modalIndex);
    }
  });

  // Register event listener for custom data changed.
  const customDataChanged = earth.filters.CustomDataChanged();
  earth.on(customDataChanged, (index) => {
    const modalIndex = parseInt(document.getElementById('tile-modal-index').innerHTML);
    if (modalIndex === Number(index)) {
      updateModal(modalIndex);
    }
  });

  async function showModal(index: number) {
    updateModal(index);

    const mintButton = document.getElementById('tile-modal-mint-button') as HTMLButtonElement;
    mintButton.onclick = async e => {
      if (!earth.signer) {
        showAlertModal("You need to connect with a wallet to send a transaction. Please reload the page and connect with a wallet to continue.");
        return;
      }

      let loading = document.getElementById("tile-modal-mint-loader");
      let loadingText = document.getElementById("tile-modal-mint-loader-text");
      mintButton.disabled = true;
      loading.style.display = "initial";
      loadingText.innerText = "Submitting transaction...";
      try {
        const tx = await earth.mint(index, { value: utils.parseEther('0.08') });
        loadingText.innerText = "Waiting for confirmation...";
        await tx.wait();
      } catch (e) {
        handlePromiseRejection(e);
      } finally {
        mintButton.disabled = false;
        loading.style.display = "none";
        updateModal(index);
      }
    }

    const setMessageButton = document.getElementById('tile-modal-customdata-submit') as HTMLButtonElement;
    setMessageButton.onclick = async e => {
      let loading = document.getElementById("tile-modal-customdata-loader");
      let loadingText = document.getElementById("tile-modal-customdata-loader-text");
      setMessageButton.disabled = true;
      loading.style.display = "initial";
      loadingText.innerText = "Submitting transaction...";

      try {
        const input = document.getElementById('tile-modal-customdata-input') as HTMLInputElement;
        const value = input.value;
        const valueBytes = utils.toUtf8Bytes(value);
        const tx = await earth.setCustomData(index, valueBytes);
        loadingText.innerText = "Waiting for confirmation...";
        await tx.wait();
        input.value = '';
      } catch (e) {
        handlePromiseRejection(e);
      } finally {
        setMessageButton.disabled = false;
        loading.style.display = "none";
        updateModal(index);
      }
    }

    // Show modal.
    modal.style.display = "block";
  }

  // Handle tile click.
  viewer.selectedEntityChanged.addEventListener((e: TileEntity) => {
    // Reset outline color for all tiles.
    tiles.forEach(t => t.polygon.outlineColor = new ConstantProperty(OUTLINE_COLOR));
    viewer.scene.requestRender();

    // If unselected, close all modals and return.
    if (e === undefined) {
      closeAllModals();
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
