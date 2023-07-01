import { utils } from "ethers";
import { LAND } from "../contract/type";
import { closeAllModals, handlePromiseRejection } from "../util";

export function addWithdrawButton(toolbar: Element, land: LAND) {
  const toolbarButton = document.createElement("button");
  toolbarButton.classList.add("cesium-button", "cesium-toolbar-button");
  toolbarButton.innerHTML = "💰";
  toolbar.appendChild(toolbarButton);

  function initModal() {
    const modal = document.getElementById('admin-modal');

    // Close on click on close span.
    var close = document.getElementById("admin-modal-close");
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
      // Update balance.
      const balance = await land.income();
      const balanceDisplay = document.getElementById('admin-modal-balance');
      balanceDisplay.innerHTML = utils.formatEther(balance) + ' ETH';

      // Update current owner.
      const owner = await land.owner();
      const ownerDisplay = document.getElementById('admin-modal-current-owner');
      ownerDisplay.innerHTML = owner;
    }

    // Withdraw button click.
    const withdraw = document.getElementById('admin-modal-button-withdraw') as HTMLButtonElement;
    withdraw.onclick = async e => {
      let loading = document.getElementById("admin-modal-withdraw-loader");
      let loadingText = document.getElementById("admin-modal-withdraw-loader-text");
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

    // Transfer ownership button click.
    const transferOwnership = document.getElementById('admin-modal-button-transfer') as HTMLButtonElement;
    transferOwnership.onclick = async e => {
      const newOwner = (document.getElementById("admin-modal-new-owner") as HTMLInputElement);

      let loading = document.getElementById("admin-modal-transfer-loader");
      let loadingText = document.getElementById("admin-modal-transfer-loader-text");
      transferOwnership.disabled = true;
      loading.style.display = "initial";
      try {
        loadingText.innerText = "Submitting transaction...";
        const tx = await land.transferOwnership(newOwner.value);
        loadingText.innerText = "Waiting for transaction confirmation...";
        await tx.wait();

        // Update UI.
        newOwner.value = "";
        refreshModal();
        if (await land.owner() != await land.signer.getAddress()) {
          modal.style.display = "none";
          toolbarButton.style.display = "none";
        }
      } catch (e) {
        handlePromiseRejection(e);
      } finally {
        transferOwnership.disabled = false;
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

    // Refresh modal on owner changed event.
    const ownerChanged = land.filters.OwnershipTransferred();
    land.on(ownerChanged, refreshModal);
  }

  initModal();
}
