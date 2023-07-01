import { ethers } from "ethers";
import { EARTH, EARTH__factory } from "./contract/type";
import contracts from "./contracts.json";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Web3Auth } from "@web3auth/web3auth";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";

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
    const ethereum = new WalletConnectProvider({
      infuraId: "de775d75c32e4d7f98f1e73caff8c616",
    });
    { // Close existing connection if desired.
      const connector = await ethereum.getWalletConnector({disableSessionCreation: true});
      if (connector.connected) {
        const keepConnection = window.confirm("Use existing WalletConnect session?");
        if (!keepConnection) {
          await ethereum.disconnect();
        }
      }
    }
    await ethereum.enable();
    return ethereum as unknown as EthereumProvider;
  }

  async function connectWithWeb3Auth(): Promise<EthereumProvider> {
    // Setup Web3Auth.
    const web3auth = new Web3Auth({
      clientId: "BBCm24ar7rZgfJeMQyrd2KZ3GFGKiuWOANQTlXT-K4odQrtjVtVVlRzLTH0WZfFJ7WPXaiRSm2fjBIx2FCybma0",
      chainConfig: {
        chainNamespace: "eip155",
        chainId: "0x5",
        rpcTarget: "https://goerli.infura.io/v3/de775d75c32e4d7f98f1e73caff8c616",
      },
    });

    // Add Torus Wallet Plugin.
    const torusPlugin = new TorusWalletConnectorPlugin({
      torusWalletOpts: {},
      walletInitOptions: {
        whiteLabel: {
          theme: { isDark: true, colors: { primary: "#00a8ff" } },
          logoDark: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
          logoLight: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        },
        useWalletConnect: true,
        enableLogging: true,
      },
    });
    web3auth.addPlugin(torusPlugin);

    // Fix modal z-index.
    const styles = '#w3a-container {position: fixed; z-index: 10;}';
    var styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Initialize modal.
    await web3auth.initModal();
    
    // Disconnected from existing session if desired.
    if (web3auth.status == "connected") {
      const keepConnection = window.confirm("Use existing session?");
      if (!keepConnection) {
        await web3auth.logout();
      }
    }

    // Show modal.
    const ethereum = await web3auth.connect();
    return ethereum;
  }

  var provider: ethers.providers.Provider;
  var signer: ethers.Signer;
  if ((document.getElementById('connector-infura') as HTMLInputElement).checked) {
    provider = new ethers.providers.InfuraProvider("goerli", "de775d75c32e4d7f98f1e73caff8c616");
    signer = ethers.Wallet.createRandom().connect(provider);
  } else {
    // Instantiate Ethereum provider.
    var ethereum: EthereumProvider;
    if ((document.getElementById('connector-browserextension') as HTMLInputElement).checked) {
      ethereum = await connectWithWindow();
    } else if ((document.getElementById('connector-walletconnect') as HTMLInputElement).checked) {
      ethereum = await connectWithWalletConnect();
    } else if ((document.getElementById('connector-web3auth') as HTMLInputElement).checked) {
      ethereum = await connectWithWeb3Auth();
    } else {
      throw new Error("Invalid Web3 provider selection.");
    }

    // Handle events.
    ethereum.on('chainChanged', function (chainID: any) {
      alert('Network changed. Please reload the page!');
    });
    ethereum.on('accountsChanged', function (accounts: any[]) {
      alert('Account changed. Please reload the page!');
    });

    // Initialize Web3 provider.
    const web3Provider = new ethers.providers.Web3Provider(ethereum);

    // Set return values.
    provider = web3Provider;
    signer = web3Provider.getSigner();
  }

  // Check network.
  provider.sendTransaction
  const chainId = (await provider.getNetwork()).chainId;
  if (chainId != CHAIN_ID) {
    throw `Not connected to network ${CHAIN_ID} (${CHAIN_NAME}). Please change network.`
  }

  // Initialize contract.
  const earth = EARTH__factory.connect(EARTH_ADDRESS, signer);
  return earth;
}