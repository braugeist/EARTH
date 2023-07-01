import { ethers } from "ethers";
import { EARTH, EARTH__factory, LAND, LAND__factory } from "./contract/type";
import contracts from "./contracts.json";
import WalletConnectProvider from "@walletconnect/web3-provider";

const CHAIN_ID = contracts.ChainId;
const CHAIN_NAME = contracts.ChainName;
const EARTH_ADDRESS = contracts.EARTH;
const LAND_ADDRESS = contracts.LAND;

export async function initWeb3(): Promise<[EARTH, LAND]> {
  // Notify user if connecting takes longer than expected.
  const connecting = document.getElementById('connect-modal-display-connecting');
  connecting.style.display = 'block';
  setTimeout(() => {
    connecting.style.display = 'none';
    document.getElementById('connect-modal-display-timeout').style.display = 'block';
  }, 10_000);

  async function connectWithWindow(): Promise<ethers.providers.ExternalProvider> {
    const ethereum = (window as any).ethereum as ethers.providers.ExternalProvider;
    if (ethereum === undefined) {
      const msg = "Failed to load Web3 extension. Please install and reload.";
      throw new Error(msg);
    }
    await ethereum.request({ method: 'eth_requestAccounts' });
    return ethereum;
  }

  async function connectWithWalletConnect(): Promise<ethers.providers.ExternalProvider> {
    const ethereum = new WalletConnectProvider({
      infuraId: "de775d75c32e4d7f98f1e73caff8c616",
    });
    await ethereum.enable();
    return ethereum;
  }

  var ethereum: ethers.providers.ExternalProvider;
  if ((document.getElementById('connector-browserextension') as HTMLInputElement).checked) {
    ethereum = await connectWithWindow();
  } else if ((document.getElementById('connector-walletconnect') as HTMLInputElement).checked) {
    ethereum = await connectWithWalletConnect();
  } else {
    throw new Error("Invalid Web3 provider selection.");
  }

  // Initialize Web3 provider.
  const provider = new ethers.providers.Web3Provider(ethereum);
  provider.on('chainChanged', function (chainID: any) {
    alert('Network changed. Please reload the page!');
  });

  // Check network.
  const chainId = await provider.send('eth_chainId', []);
  if (chainId != CHAIN_ID) {
    throw `Not connected to network ${CHAIN_ID} (${CHAIN_NAME}). Please change network.`
  }

  // Get signer.
  const signer = provider.getSigner();
  console.log(`account = ${await signer.getAddress()}`);
  provider.on('accountsChanged', function (accounts: any[]) {
    alert('Account changed. Please reload the page!');
  });

  // Initialize contracts.
  const earth = EARTH__factory.connect(EARTH_ADDRESS, signer);
  const land = LAND__factory.connect(LAND_ADDRESS, signer);

  return [earth, land];
}