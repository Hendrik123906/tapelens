// Deploy TapeLensVerifier to X Layer TESTNET (chain 1952) — free test OKB only.
// Requires env TAPEOUT_TESTNET_KEY = throwaway testnet-only private key.
// NEVER use a real wallet key here. Never deploys to mainnet.
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  if (hre.network.name !== "xlayerTestnet") {
    throw new Error("Refusing: deploy script only runs on --network xlayerTestnet");
  }
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance (test OKB):", ethers.formatEther(balance));
  if (balance === 0n) {
    throw new Error(
      "No testnet OKB. Fund this throwaway address from the OKX X Layer testnet faucet (free, no real funds): https://www.okx.com/xlayer/faucet — then re-run."
    );
  }
  const Factory = await ethers.getContractFactory("TapeLensVerifier");
  const verifier = await Factory.deploy();
  await verifier.waitForDeployment();
  const address = await verifier.getAddress();
  console.log("TapeLensVerifier deployed to X Layer testnet:", address);
  const tx = verifier.deploymentTransaction();
  const rec = { network: "X Layer testnet", chainId: 1952, contract: "TapeLensVerifier", address, deployTx: tx ? tx.hash : null, deployer: deployer.address, deployedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(__dirname, "..", "data", "deployment-testnet.json"), JSON.stringify(rec, null, 2));
  console.log("Wrote data/deployment-testnet.json");
}

main().catch((e) => {
  console.error("Deploy FAILED:", e.message || e);
  process.exit(1);
});
