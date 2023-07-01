export function addHelpButton(toolbar: Element) {
  const helpButton = document.createElement("button");
  helpButton.classList.add("cesium-button", "cesium-toolbar-button");
  helpButton.innerHTML = "?";
  toolbar.appendChild(helpButton);

  function initModal() {
    const modal = document.getElementById('help-modal');

    // Close on click on close span.
    var close = document.getElementById("help-modal-close");
    close.onclick = function () {
      modal.style.display = "none";
    };

    // Close on click outside modal.
    window.addEventListener('click', e => {
      if (e.target == modal) {
        modal.style.display = "none";
      }
    });

    function showModal() {
      modal.style.display = "block";
    }

    helpButton.onclick = showModal;
  }

  initModal();
}