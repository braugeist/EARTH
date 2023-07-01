SK_DEPLOYER=0xb5dc82fc5f4d82b59a38ac963a15eaaedf414f496a037bb4a52310915ac84097
AMOUNT=100000000000000000000

echo "Start Ganache"
ganache-cli --wallet.accounts $SK_DEPLOYER,$AMOUNT --database.dbPath db &
PID=$!

# Stop Ganache on exit.
trap "kill $PID" EXIT

echo "Waiting for Ganache to be ready..."
sleep 1

echo "Deploy contracts"
node deploy.js $SK_DEPLOYER

cd .. && npx webpack serve --config webpack.config.js --open
