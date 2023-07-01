import { ethers } from "ethers";

const logDisplay = document.getElementById("logdisplay");
const contractDir = './contract'

const numTiles = 812;

function log(msg: string) {
  console.log(msg);
  const date = (new Date()).toLocaleString();
  logDisplay.innerText += `${date}: ${msg}\n`;
}

function alert(msg: string) {
  log(`Alert: ${msg}`);
  window.alert(msg);
}

function enableErrorHandling() {
  window.onerror = err => {
    alert(`Error: ${err}`);
  }

  window.onunhandledrejection = (e: PromiseRejectionEvent) => {
    e.preventDefault();

    const msg = function(e: PromiseRejectionEvent): string {
      const reason = e.reason;
      if (reason.message !== undefined) {
        return reason.message;
      }
      return reason;
    }(e);
    alert(`Error: Promise rejected: ${msg}`);
  };
}

enableErrorHandling();

async function loadJSON(url: string): Promise<any> {
  const data = await fetch(url);
  return await data.json();
}

async function loadText(url: string): Promise<string> {
  const data = await fetch(url);
  return await data.text();
}

async function main() {
  // Initialize provider.
  const ethereum = (window as any).ethereum;
  if (ethereum === undefined) {
    const msg = "Could not find Web3 extension. Please install and reload.";
    throw new Error(msg);
  }
  const provider = new ethers.providers.Web3Provider(ethereum);
  ethereum.on('chainChanged', function (chainID: any) {
    alert('Network changed. Please reload the page!');
  });

  // Connect to Web3.
  const accounts = await provider.send("eth_requestAccounts", []);
  log("Connected to Web3.");

  // Get signer.
  const signer = provider.getSigner();
  log(`account = ${await signer.getAddress()}`);
  ethereum.on('accountsChanged', function (accounts: any[]) {
    alert('Account changed. Please reload the page!');
  });

  async function deployContract(name: string, gasLimit: number, ...args: any[]) {
    log(`Deploying ${name}...`);

    // Load ABI and code.
    const abi = await loadJSON(`${contractDir}/${name}.abi`);
    const code = '0x' + await loadText(`${contractDir}/${name}.bin`);
    log('ABI and code loaded.');

    // Create contract factory.
    const factory = new ethers.ContractFactory(abi, code, signer);

    // Send deploy transaction.
    const contract = await factory.deploy(...args, { gasLimit: gasLimit });
    log('Deploy transaction submitted. Waiting for confirmation...');
    const tr = await contract.deployTransaction.wait();
    log('Deploy transaction confirmed.');

    // Print gas usage information.
    const gasUsed = tr.gasUsed.toNumber().toLocaleString();
    const gasPrice = ethers.utils.formatUnits(tr.effectiveGasPrice, 'gwei');
    const gasCost = ethers.utils.formatEther(tr.gasUsed.mul(tr.effectiveGasPrice));
    log(`Gas used: ${gasUsed}. Gas price: ${gasPrice} gwei. Gas cost: ${gasCost} ether.`);

    return contract;
  }

  const EARTH = await deployContract('EARTH', 3_000_000, numTiles);

  // Output configuration.
  const network = await provider.getNetwork();
  const config = {
    "ChainId": network.chainId,
    "ChainName": network.name,
    "EARTH": EARTH.address,
  }
  const configString = JSON.stringify(config, null, 2);
  log(`Configuration: ${configString}`);
}

document.getElementById("deploy-button").onclick = e => main();
