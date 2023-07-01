import { addHelpButton } from "./help";

export async function initToolbar() {
  const toolbar = document.querySelector('div.cesium-viewer-toolbar');

  // Add help button.
  addHelpButton(toolbar);
}