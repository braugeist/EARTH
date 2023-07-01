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
npm run generate-metadata
npm run generate-images # requires Python, Selenium, Firefox
```


## TODO

- If connected to wrong network, prompt wallet to change network via `wallet_switchEthereumChain`.
- Show world without connecting.
- Deploy contracts with source code.
- Add arbitrary state to each NFT in contract.
- Add withdraw functionality.
