// Generate a THROWAWAY keypair for X Layer TESTNET deployment only.
// Prints the address + private key ONCE to stdout. Testnet only, zero value.
// Never reuse this key on mainnet, never fund it with real assets.
const { ethers } = require("ethers");

const w = ethers.Wallet.createRandom();
console.log("Testnet-only throwaway wallet (X Layer testnet, chain 195):");
console.log("  Address:     ", w.address);
console.log("  Private key: ", w.privateKey);
console.log("");
console.log("Next steps:");
console.log("  1. Fund it with FREE test OKB from the OKX faucet: https://www.okx.com/xlayer/faucet");
console.log("  2. Export it for this shell only: export TAPEOUT_TESTNET_KEY=<key above>");
console.log("  3. Deploy: npx hardhat run scripts/deploy.js --network xlayerTestnet");
console.log("Do NOT save this key in the repo. Do NOT use it on mainnet.");
