import { utils } from "ethers";
import { LAND } from "../contract/type";
import { closeAllModals, handlePromiseRejection, ZERO_ADDRESS } from "../util";

export const AUCTION_BUTTON_ID = 'auction-button';

export function addAuctionButton(toolbar: Element, land: LAND) {
  const auctionButton = document.createElement("button");
  auctionButton.id = AUCTION_BUTTON_ID;
  auctionButton.classList.add("cesium-button", "cesium-toolbar-button");
  auctionButton.innerHTML = "+";
  toolbar.appendChild(auctionButton);

  function initModal() {
    const modal = document.getElementById('auction-modal');

    // Close on click on close span.
    var close = document.getElementById("auction-modal-close");
    close.onclick = function () {
      modal.style.display = "none";
    };

    // Close on click outside modal.
    window.addEventListener('click', e => {
      if (e.target == modal) {
        modal.style.display = "none";
      }
    });

    // Bid button click.
    const bidButton = document.getElementById('auction-modal-button-bid') as HTMLButtonElement;
    bidButton.onclick = async e => {
      const bidValue = (document.getElementById('auction-modal-input-bid') as HTMLInputElement).value;
      const bidCurrency = 'ETH';
      const bid = ((value: string, currency: string) => {
        switch (currency) {
          case 'ETH':
            return utils.parseEther(value);
          case 'WEI':
            return utils.parseUnits(value, 'wei');
          default:
            throw 'invalid currency';
        }
      })(bidValue, bidCurrency);

      let loading = document.getElementById("auction-modal-button-bid-loader");
      let loadingText = document.getElementById("auction-modal-button-bid-loader-text");
      bidButton.disabled = true;
      loading.style.display = "initial";
      try {
        loadingText.innerText = "Submitting bid transaction...";
        const tx = await land.bid({ 'value': bid });
        loadingText.innerText = "Waiting for transaction confirmation...";
        await tx.wait();
        refreshModal();
      } catch (e) {
        handlePromiseRejection(e);
      } finally {
        bidButton.disabled = false;
        loading.style.display = "none";
      }
    };

    // Payout button click.
    const payoutButton = document.getElementById('auction-modal-button-payout') as HTMLButtonElement;
    payoutButton.onclick = async e => {
      let loading = document.getElementById("auction-modal-button-payout-loader");
      let loadingText = document.getElementById("auction-modal-button-payout-loader-text");
      payoutButton.disabled = true;
      loading.style.display = "initial";

      try {
        loadingText.innerText = "Submitting conclude transaction...";
        const tx = await land.conclude();
        loadingText.innerText = "Waiting for transaction confirmation...";
        await tx.wait();
        refreshModal();
      } catch (e) {
        handlePromiseRejection(e);
      } finally {
        payoutButton.disabled = false;
        loading.style.display = "none";
      }
    };

    async function refreshModal() {
      // Update index.
      const index = (await land.index()).add(1);
      const totalSupply = await land.maxSupply();
      document.getElementById('auction-modal-td-index').innerHTML = `${index}/${totalSupply}`;

      // Update payout date.
      const payoutDate = await land.concludeDate();
      const date = new Date(payoutDate.toNumber() * 1000);
      document.getElementById('auction-modal-field-payout').innerHTML = date.toLocaleString();

      // Update highest bid.
      const bid = await land.getBid();
      const bidder = await land.bidder();
      const bidDisplay = document.getElementById('auction-modal-field-bid');
      const hasBidder = bidder != ZERO_ADDRESS;
      bidDisplay.innerHTML = hasBidder ? `${utils.formatEther(bid)} ETH by ${bidder}` : 'None';

      // Update bid value.
      (document.getElementById('auction-modal-input-bid') as HTMLInputElement).value = utils.formatEther(bid.add(utils.parseEther("1.0")));

      // Update payout visibility.
      payoutButton.disabled = new Date() < date || !hasBidder;
      document.getElementById('auction-modal-button-payout-info').style.display = new Date() >= date && !hasBidder ? 'initial' : 'none';
    }

    async function showModal() {
      // Refresh modal.
      await refreshModal();

      // Show modal.
      closeAllModals();
      modal.style.display = "block";
    }

    auctionButton.onclick = showModal;

    // Refresh modal on Bid event.
    const bid = land.filters.Bid();
    land.on(bid, refreshModal);

    // Refresh modal on Payout event.
    const payout = land.filters.Concluded();
    land.on(payout, refreshModal);
  }

  initModal();
}
