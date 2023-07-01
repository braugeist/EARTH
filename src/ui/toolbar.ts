import { EARTH, LAND } from "../contract/type";
import { addHelpButton } from "./help";
import { addAuctionButton } from "./auction";
import { addBalanceDisplay } from "./balance";

export async function initToolbar(land: LAND) {
  const toolbar = document.querySelector('div.cesium-viewer-toolbar');
  
  // Add balance display.
  await addBalanceDisplay(toolbar, land);

  // Add auction button.
  addAuctionButton(toolbar, land);

  // Add help button.
  addHelpButton(toolbar);
}