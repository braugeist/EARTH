# BUILD EARTH

**Disclaimer:**
The code is not pretty, but it should work.

## Requirements

- Checkout with submodules 
- Install npm

## Build and run
```bash
npm install # install dependencies
npm run build # build
npm run ganache # start local blockchain
npm run deploy-contract-ganache # deploy contracts
npm run webpack # start local web server
```

## Generate metadata
```bash
npm run generate-metadata-json
npm run generate-metadata-images # requires Python, Selenium, Firefox
```

## Deployment
```bash
npm run generate-contract-flat # generate single-file contracts
```

## Testnet URLs

### Sepolia

- [EARTH](https://sepolia.etherscan.io/address/0x689ccA9CcD739275069fb7FC0Ad4c08Dd66f9E70)

### Goerli (Deprecated)
- [EARTH](https://goerli.etherscan.io/address/0x892F72C82525994A27F8C6E6B9C462DE07AAA3b6)
- [OpenSea](https://testnets.opensea.io/collection/earth-19)

## TODO

### High priority

- Show my tiles

### Medium priority

- Toggle show/hide all tile messages.
- Indicate loading when reading blockchain data.
- Improve performance by using different geometry for drawing tiles.
- If connected to wrong network, prompt wallet to change network via `wallet_switchEthereumChain`.

### Low priority

- Cleanup HTML and CSS
- Add more attributes? (Climate zone, Highest point, Lowest point, Population)
