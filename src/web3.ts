import { ethers } from "ethers";
import { EARTH_sol_EARTH as EARTH, EARTH_sol_EARTH__factory as EARTH__factory } from "./contract/type";
import contracts from "./contracts.json";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { showAlertModal } from "./util";

const CHAIN_ID = contracts.ChainId;
const CHAIN_NAME = contracts.ChainName;
const EARTH_ADDRESS = contracts.EARTH;

export async function initWeb3(): Promise<EARTH> {
  // Notify user if connecting takes longer than expected.
  const statusDisplay = document.getElementById('connect-modal-status');
  statusDisplay.innerText = "Connecting...";
  statusDisplay.style.display = 'block';
  setTimeout(() => {
    statusDisplay.innerHTML = `Connecting to Web3 takes longer than expected. Consider <span onclick="location.reload()" style="text-decoration: underline; cursor: pointer;">reloading</span> the page.`;
  }, 10_000);

  interface EthereumProvider extends ethers.providers.ExternalProvider {
    on(eventName: string, listener: (...args: unknown[]) => void): void;
  }

  async function connectWithWindow(): Promise<EthereumProvider> {
    const ethereum = (window as any).ethereum;
    if (ethereum === undefined) {
      const msg = "Failed to load Web3 extension. Please install and reload.";
      throw new Error(msg);
    }
    await ethereum.request({ method: 'eth_requestAccounts' });
    return ethereum;
  }

  async function connectWithWalletConnect(): Promise<EthereumProvider> {
    const provider = await EthereumProvider.init({
      projectId: "d43b3135fd56e5a5b8b2d4c1a1c37400",
      chains: [CHAIN_ID],
      showQrModal: true,
    });

    await provider.disconnect();

    await provider.enable();
    return provider;
  }

  var provider: ethers.providers.Provider;
  var signer: ethers.Signer;
  if ((document.getElementById('connector-infura') as HTMLInputElement).checked) {
    provider = new ethers.providers.InfuraProvider("homestead", "de775d75c32e4d7f98f1e73caff8c616");
    signer = null;
  } else {
    // Instantiate Ethereum provider.
    var ethereum: EthereumProvider;
    if ((document.getElementById('connector-browserextension') as HTMLInputElement).checked) {
      ethereum = await connectWithWindow();
    } else if ((document.getElementById('connector-walletconnect') as HTMLInputElement).checked) {
      ethereum = await connectWithWalletConnect();
    } else {
      throw new Error("Invalid Web3 provider selection.");
    }

    // Handle events.
    ethereum.on('chainChanged', function (chainID: any) {
      showAlertModal('Network changed. Please reload the page!');
    });
    ethereum.on('accountsChanged', function (accounts: any[]) {
      showAlertModal('Account changed. Please reload the page!');
    });

    // Initialize Web3 provider.
    const web3Provider = new ethers.providers.Web3Provider(ethereum);

    // Set return values.
    provider = web3Provider;
    signer = web3Provider.getSigner();
  }

  // Check network.
  const chainId = (await provider.getNetwork()).chainId;
  if (chainId != CHAIN_ID) {
    throw `Not connected to network ${CHAIN_ID} (${CHAIN_NAME}). Please change network.`
  }

  // Initialize contract.
  const earth = EARTH__factory.connect(EARTH_ADDRESS, signer || provider);
  document.getElementById('help-modal-contract').innerHTML = earth.address;
  return earth;
}