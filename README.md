# EARTH

## Requirements

- npm

## Commands

### Build and run
```bash
npm install # install dependencies
npm run build # build
npm run start-ganache # start local blockchain
npm run deploy-contract-ganache # deploy contracts
npm run start-webpack # start local web server
```

### Generate metadata
```bash
npm run generate-metadata-json
npm run generate-metadata-images # requires Python, Selenium, Firefox
```

### Deployment
```bash
npm run generate-contract-flat # generate single-file contracts
```

## TODO

- Prepare setup for deployment on Mainnet.
    - Which wallet to use?
    - Set auction duration to 1day.
    - Prepare OpenSea text.

### Low Priority

- If connected to wrong network, prompt wallet to change network via `wallet_switchEthereumChain`.

## Testnet URLs

OpenSEA: https://testnets.opensea.io/collection/earth-ozaiynq6xl
LAND: https://rinkeby.etherscan.io/token/0x36154023b3a7d15c60fe99f14c1ed4d0b0de53d4#writeContract
EARTH: https://rinkeby.etherscan.io/address/0x30E8782433b7cE079E8772c7f756E3bEfa6Aebb3#tokentxns
