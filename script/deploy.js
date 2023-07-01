const ethers = require("ethers");
const fs = require('fs');

const url = "http://localhost:8545";
const privateKey = "0xb5dc82fc5f4d82b59a38ac963a15eaaedf414f496a037bb4a52310915ac84097";
// const privateKey = process.argv[2];
const build = "../src/contract/build"

const provider = new ethers.providers.JsonRpcProvider(url);
const signer = new ethers.Wallet(privateKey, provider);

async function deployContract(name, ...args) {
    const abi = JSON.parse(fs.readFileSync(`${build}/${name}.abi`));
    const code = '0x' + fs.readFileSync(`${build}/${name}.bin`);
    const factory = new ethers.ContractFactory(abi, code, signer);
    const contract = await factory.deploy(...args);
    await contract.deployTransaction.wait();
    return contract;
}

(async() => {
    const numTiles = 812;
    const auctionDuration = 15;
    const LAND = await deployContract('LAND', numTiles, auctionDuration);
    await deployContract('EARTH', LAND.address);
})();
