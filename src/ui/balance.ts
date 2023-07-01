import { LAND } from "../contract/type";

export async function addBalanceDisplay(toolbar: Element, land: LAND) {
  const balanceSpan = document.createElement('span');
  balanceSpan.id = 'balance-span';
  balanceSpan.classList.add('cesium-infoBox-description');
  async function updateBalance() {
    const balance = await land.balanceOf(await land.signer.getAddress());
    balanceSpan.innerHTML = `${balance} LND`;
  }
  await updateBalance();
  toolbar.appendChild(balanceSpan);

  // Add balance change listener.
  const account = await land.signer.getAddress();
  const filters = [
    land.filters.Concluded(account),
    land.filters.Transfer(account),
    land.filters.Transfer(null, account),
  ];
  filters.forEach(f => {
    land.on(f, updateBalance);
  });
}