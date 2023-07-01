const ethers = require("ethers");
const fs = require('fs');
const yargs = require('yargs');

const argv = yargs
  .usage(
    '$0 [options]',
    'Deploy contracts LAND and EARTH.',
  )
  .option('nodeURL', {
    alias: 'n',
    description: 'The URL of the node to connect to.',
    type: 'string',
    default: 'http://localhost:8545',
  })
  .option('auctionDuration', {
    alias: 'd',
    description: 'The duration of a LAND auction in seconds.',
    type: 'number',
    default: 24 * 3600,
  })
  .option('privateKey', {
    alias: 'k',
    description: 'The private key used for deployment.',
    type: 'string',
  })
  .option('outFile', {
    alias: 'o',
    description: 'The file where the contract addresses are written to.',
    type: 'string',
  })
  .option('contractsDir', {
    alias: 'c',
    description: 'The directory where the compiled contracts are located.',
    type: 'string',
    default: '../src/contract/build',
  })
  .help().alias('help', 'h')
  .version(false).argv;

async function deployEarthAndLand(argv) {
  const provider = new ethers.providers.JsonRpcProvider(argv.nodeURL);
  const signer = new ethers.Wallet(argv.privateKey, provider);

  async function deployContract(name, ...args) {
    console.log(`Deploying ${name}...`);
    const abi = JSON.parse(fs.readFileSync(`${argv.contractsDir}/${name}.abi`));
    const code = '0x' + fs.readFileSync(`${argv.contractsDir}/${name}.bin`);
    const factory = new ethers.ContractFactory(abi, code, signer);
    const contract = await factory.deploy(...args, {gasLimit: 3_000_000, gasPrice: 30_000_000_000});
    const tr = await contract.deployTransaction.wait();
    const gasUsed = tr.gasUsed.toNumber().toLocaleString();
    const gasPrice = ethers.utils.formatUnits(tr.effectiveGasPrice, 'gwei');
    const gasCost = ethers.utils.formatEther(tr.gasUsed.mul(tr.effectiveGasPrice));
    console.log(`Done. Gas used: ${gasUsed}. Gas Price: ${gasPrice} gwei. Gas cost: ${gasCost} ether.`);
    return contract;
  }

  const numTiles = 812;
  const LAND = await deployContract('LAND', numTiles, argv.auctionDuration);
  const EARTH = await deployContract('EARTH', LAND.address);

  const network = await provider.getNetwork();
  const addresses = {
    "ChainId": network.chainId,
    "ChainName": network.name,
    "LAND": LAND.address,
    "EARTH": EARTH.address,
  }
  console.log(addresses);
  if (argv.outFile) {
    const data = JSON.stringify(addresses, null, 2);
    fs.writeFileSync(argv.outFile, data);
    console.log("Contract addresses written to: " + argv.outFile);
  }
}

deployEarthAndLand(argv);
