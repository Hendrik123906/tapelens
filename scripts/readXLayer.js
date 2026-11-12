// Read-only snapshot of live TapeOut data on X Layer mainnet (chain 196).
// No wallet, no signing, no funds — pure eth_call reads against the public
// OKX RPC. Writes data/xlayer-snapshot.json.
//
// Verified source addresses (independent terminal tapeout.work, 12 Nov 2026):
//   TapeOut factory (X Layer): 0x1f09daefa827f02cbb40967cc91b259763760761
//   BEM on X Layer:            0x60e62efa9405d6873c5deabd4e6cc91c25363952
//   Rig voucher (X Layer):     0x9cfc959cd42b2e1d39a0d850c528210e818ae520
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = "https://rpc.xlayer.tech";
const FACTORY = "0x1f09daefa827f02cbb40967cc91b259763760761";
const BEM_XLAYER = "0x60e62efa9405d6873c5deabd4e6cc91c25363952";
const RIG_VOUCHER = "0x9cfc959cd42b2e1d39a0d850c528210e818ae520";

const FACTORY_ABI = [
  "function cpuCount() view returns (uint256)",
  "function cpuAt(uint256) view returns (address)",
];
const PROCESSOR_ABI = ["function nextId() view returns (uint256)"];
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const out = { rpc: RPC_URL, chain: "X Layer", chainId: 196, readAt: new Date().toISOString() };

  const net = await provider.getNetwork();
  out.networkChainId = Number(net.chainId);
  out.blockNumber = await provider.getBlockNumber();

  const factoryCode = await provider.getCode(FACTORY);
  out.factory = { address: FACTORY, hasCode: factoryCode !== "0x", codeLength: (factoryCode.length - 2) / 2 };

  const factory = new ethers.Contract(FACTORY, FACTORY_ABI, provider);
  const count = await factory.cpuCount();
  out.factory.processorCount = Number(count);

  out.processors = [];
  const n = Math.min(5, Number(count));
  for (let i = 0; i < n; i++) {
    const addr = await factory.cpuAt(i);
    const entry = { index: i, address: addr };
    try {
      const proc = new ethers.Contract(addr, PROCESSOR_ABI, provider);
      entry.nextCircuitId = Number(await proc.nextId());
    } catch (e) {
      entry.nextCircuitId = null;
      entry.nextIdError = String(e).slice(0, 160);
    }
    out.processors.push(entry);
  }

  const bem = new ethers.Contract(BEM_XLAYER, ERC20_ABI, provider);
  out.bemXLayer = {
    address: BEM_XLAYER,
    name: await bem.name().catch(() => null),
    symbol: await bem.symbol().catch(() => null),
    decimals: Number(await bem.decimals().catch(() => 8)),
    totalSupplyRaw: (await bem.totalSupply()).toString(),
  };

  const voucher = new ethers.Contract(RIG_VOUCHER, ERC20_ABI, provider);
  out.rigVoucher = {
    address: RIG_VOUCHER,
    totalSupplyRaw: (await voucher.totalSupply().catch(() => null))?.toString() ?? null,
  };

  const file = path.join(__dirname, "..", "data", "xlayer-snapshot.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  console.log("Wrote", file);
}

main().catch((e) => {
  console.error("readXLayer FAILED:", e);
  process.exit(1);
});
