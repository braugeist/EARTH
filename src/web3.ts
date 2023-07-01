import Viewer from "cesium/Source/Widgets/Viewer/Viewer";
import { ethers } from "ethers";
import { EARTH, EARTH__factory, LAND, LAND__factory } from "./contract/type";
import { TileEntity } from "./grid";
import contracts from "./contracts.json";

const CHAIN_ID = contracts.ChainId;
const CHAIN_NAME = contracts.ChainName;
const EARTH_ADDRESS = contracts.EARTH;
const LAND_ADDRESS = contracts.LAND;

export async function initWeb3(viewer: Viewer, tiles: TileEntity[]): Promise<[EARTH, LAND]> {
  // Initialize provider.
  const ethereum = (window as any).ethereum;
  if (ethereum === undefined) {
    const msg = "Error: window.ethereum undefined. Please install Metamask extension.";
    alert(msg);
    throw new Error(msg);
  }
  const provider = new ethers.providers.Web3Provider(ethereum);
  ethereum.on('chainChanged', function (chainID: any) {
    alert('Network changed. Please reload the page!');
  });

  // Connect to MetaMask.
  const accounts = provider.send("eth_requestAccounts", []);
  const connecting = document.getElementById('connect-modal-display-connecting');
  connecting.style.display = 'block';
  setTimeout(() => {
    connecting.style.display = 'none';
    document.getElementById('connect-modal-display-timeout').style.display = 'block';
  }, 10_000);
  await accounts;

  // Check network.
  const chainId = await provider.send('eth_chainId', []);
  if (chainId != CHAIN_ID) {
    throw `Not connected to network ${CHAIN_ID} (${CHAIN_NAME}). Please change network.`
  }

  // Get signer.
  const signer = provider.getSigner();
  console.log(`account = ${await signer.getAddress()}`);
  ethereum.on('accountsChanged', function (accounts: any[]) {
    alert('Account changed. Please reload the page!');
  });

  // Initialize contracts.
  const earth = EARTH__factory.connect(EARTH_ADDRESS, signer);
  const land = LAND__factory.connect(LAND_ADDRESS, signer);

  return [earth, land];
}