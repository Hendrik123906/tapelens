require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    // X Layer testnet (chain id 1952, post-OP-Stack migration).
    // Official RPC testnet-rpc.xlayer.tech is DEAD from this VM (timeouts
    // 12 Nov) — working alt: https://testrpc.xlayer.tech (verified
    // 12 Nov 17:18 WIB, eth_chainId 0x7a0 = 1952). Free test OKB from the
    // OKX faucet.
    // Deploy key comes ONLY from env TAPEOUT_TESTNET_KEY (testnet-only,
    // throwaway key — never a real wallet, never mainnet funds).
    xlayerTestnet: {
      url: "https://testrpc.xlayer.tech",
      chainId: 1952,
      accounts: process.env.TAPEOUT_TESTNET_KEY
        ? [process.env.TAPEOUT_TESTNET_KEY]
        : [],
    },
  },
};
