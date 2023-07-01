import { utils } from "ethers";
import { LAND } from "../contract/type";
import { closeAllModals, handlePromiseRejection, ZERO_ADDRESS } from "../util";

export function addWithdrawButton(toolbar: Element, land: LAND) {
  const toolbarButton = document.createElement("button");
  toolbarButton.classList.add("cesium-button", "cesium-toolbar-button");
  toolbarButton.innerHTML = "💰";
  toolbar.appendChild(toolbarButton);

  function initModal() {
    const modal = document.getElementById('withdraw-modal');

    // Close on click on close span.
    var close = document.getElementById("withdraw-modal-close");
    close.onclick = function () {
      modal.style.display = "none";
    };

    // Close on click outside modal.
    window.addEventListener('click', e => {
      if (e.target == modal) {
        modal.style.display = "none";
      }
    });

    async function refreshModal() {
        const balance = await land.income();
        const balanceDisplay = document.getElementById('withdraw-modal-balance');
        balanceDisplay.innerHTML = utils.formatEther(balance) + ' ETH';
    }

    // Withdraw button click.
    const withdraw = document.getElementById('withdraw-modal-button-withdraw') as HTMLButtonElement;
    withdraw.onclick = async e => {
      let loading = document.getElementById("withdraw-modal-loader");
      let loadingText = document.getElementById("withdraw-modal-loader-text");
      withdraw.disabled = true;
      loading.style.display = "initial";
      try {
        loadingText.innerText = "Submitting transaction...";
        const tx = await land.withdraw();
        loadingText.innerText = "Waiting for transaction confirmation...";
        await tx.wait();
        refreshModal();
      } catch (e) {
        handlePromiseRejection(e);
      } finally {
        withdraw.disabled = false;
        loading.style.display = "none";
      }
    };

    async function showModal() {
      // Refresh modal.
      await refreshModal();

      // Show modal.
      closeAllModals();
      modal.style.display = "block";
    }

    toolbarButton.onclick = showModal;

    // Refresh modal on Payout event.
    const payout = land.filters.Concluded();
    land.on(payout, refreshModal);
  }

  initModal();
}
