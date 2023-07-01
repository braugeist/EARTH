import { EARTH, LAND } from "../contract/type";
import { addHelpButton } from "./help";
import { addAuctionButton } from "./auction";
import { addBalanceDisplay } from "./balance";
import { addWithdrawButton } from "./withdraw";

export async function initToolbar(land: LAND) {
  const toolbar = document.querySelector('div.cesium-viewer-toolbar');
  
  // Add balance display.
  await addBalanceDisplay(toolbar, land);

  // Add auction button.
  addAuctionButton(toolbar, land);

  // Add withdraw button.
  if (await land.owner() == await land.signer.getAddress()) {
    addWithdrawButton(toolbar, land);
  }

  // Add help button.
  addHelpButton(toolbar);
}