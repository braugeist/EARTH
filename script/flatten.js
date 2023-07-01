const flatten = require("truffle-flattener");
const path = require("path");
const fs = require('fs');

const rootDir = path.resolve('..');
const contractDir = path.join(rootDir, 'src/contract/');
const flatDir = path.join(rootDir, 'tmp/contract/');

async function flattenContract(name) {
    // Create output directory if it does not exist.
    if (!fs.existsSync(flatDir)) {
        fs.mkdirSync(flatDir, { recursive: true });
    }

    // Flatten source.
    const flat = await flatten(
        [path.join(contractDir, `${name}.sol`)],
        rootDir,
    );

    // Strip duplicate license identifiers.
    function stripDuplicateLicenses(flat) {
        let lines = flat.split('\n');
        const isLicense = l => l.startsWith('// SPDX-License-Identifier:');
        const licenses = lines.filter(isLicense);
        const license = licenses[0];

        // Check equal.
        const unequal = licenses.filter(l => l != license);
        if (unequal.length > 0) {
            throw 'unequal licenses';
        }

        const stripped = lines.filter(l => !isLicense(l));
        return `${license}\n\n` + stripped.join('\n');
    }
    const flatStripped = stripDuplicateLicenses(flat);

    // Write to file.
    const outputFilePath = path.join(flatDir, `${name}.flat.sol`);
    fs.writeFileSync(outputFilePath, flatStripped);
}

async function main() {
    await flattenContract('EARTH');
    await flattenContract('LAND');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
