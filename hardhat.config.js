require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    // X Layer testnet (chain id 195). Free test OKB from the OKX faucet.
    // Deploy key comes ONLY from env TAPEOUT_TESTNET_KEY (testnet-only,
    // throwaway key — never a real wallet, never mainnet funds).
    xlayerTestnet: {
      url: "https://testnet-rpc.xlayer.tech",
      chainId: 195,
      accounts: process.env.TAPEOUT_TESTNET_KEY
        ? [process.env.TAPEOUT_TESTNET_KEY]
        : [],
    },
  },
};
