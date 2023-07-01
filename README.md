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

- Add arbitrary state to each NFT in contract.
- Add more admin functions to UI? (e.g., `transferOwnership`)
- Verify LAND contract.
- Prepare setup for deployment on Mainnet.
    - Which wallet to use?
    - Set auction duration to 1day.
    - Prepare OpenSea text.

- If connected to wrong network, prompt wallet to change network via `wallet_switchEthereumChain`.

## Testnet URL OpenSea

https://testnets.opensea.io/collection/earth-ozaiynq6xl
