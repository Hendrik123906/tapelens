# TapeLens — Circuit Verifier for TapeOut on X Layer

**Hackathon:** X Layer TapeOut Accelerate (OKX Web3 Build X Series) — 100,000 USDT prize pool, deadline **7 Dec 2026 23:59 UTC** (8 Dec 06:59 WIB).
**Entry page:** https://web3.okx.com/xlayer/build-x-series

## The problem

A TapeOut circuit is a netlist of NAND gates (+ LATCH state cells) minted as a Circuit NFT — and it can be registered as a PoD mining machine earning $BEM. But buying or mining a circuit today is **blind**: nothing on chain proves what logic the circuit actually implements. A mislabeled, copied, or broken circuit can be sold or staked as if it were the real thing.

## The product

TapeLens proves what a circuit does — on chain, for every input combination:

1. **On-chain verifier — `contracts/TapeLensVerifier.sol`.** Submit a NAND netlist + claimed truth table. The contract re-evaluates the netlist for *every* input combination and reverts unless it matches exactly. On success it records `verified[keccak256(netlist)] = true` and emits `CircuitVerified`. One read call lets a marketplace, a PoD miner, or a buyer check any circuit. Pure logic: no owner, no funds, no token, no upgradeability.
2. **In-browser simulator + netlist builder — `simulator/netlist.js` + `frontend/index.html`.** Pick a template (Half Adder, Full Adder, 2-to-1 MUX, 2-bit Multiplier), see the NAND gate list, simulate the full truth table, and get the exact netlist hash + calldata for the on-chain call. Works offline except the optional live X Layer panel. Single static file — **DeWEB-ready** (publishable as a `tape://` site via TapeKit/TapeCode, no server needed). Includes an interactive SR-LATCH demo (TapeOut's memory primitive).
3. **Live X Layer data — `scripts/readXLayer.js`.** Read-only `eth_call`s against the public OKX RPC: TapeOut factory, processors, $BEM supply. Snapshot: `data/xlayer-snapshot.json`. No wallet, no signing, no funds.

## TapeOut usage (eligibility)

- Uses **TapeOut on-chain data on X Layer**: the protocol factory (`0x1f09daefa827f02cbb40967cc91b259763760761`, 416 processors), live processor circuits, and $BEM (`0x60e62efa9405d6873c5deabd4e6cc91c25363952`).
- Uses **existing TapeOut processors/circuits** — the FAQ explicitly allows building on existing processors and tools; TapeLens verifies circuits from *any* TapeOut processor instead of launching yet another one.
- DeWEB-ready static frontend (runs as a `tape://` site; deployment is a later step, not claimed as done).
- Developer-tool direction — explicitly eligible ("developer tools, circuit design").

## Status (honest, 12 Nov 2026)

| Item | Status |
|---|---|
| Contract written + compiled | ✅ |
| Hardhat tests | ✅ **24/24 passing** (local chain) |
| JS simulator vs reference truth tables | ✅ verified for all 4 templates |
| JS ↔ Solidity hash encoding cross-check | ✅ identical |
| Live X Layer read (factory/processors/BEM) | ✅ snapshot 12 Nov 2026, block 75,695,624 |
| Frontend demo | ✅ built (`frontend/index.html`, single file) |
| Testnet deploy (X Layer testnet, chain 195) | ⏳ needs free test OKB from OKX faucet (user/parent step) |
| Submission form | ⏳ user-only (Google Form, needs login) |
| Demo video ≤ 3 min | ⏳ script ready (`docs/DEMO_SCRIPT.md`), not recorded |

## Run it (all free, no wallet, no mainnet)

```bash
npm install
npx hardhat test            # 24 tests, local chain
node scripts/readXLayer.js  # live read from X Layer mainnet (read-only)
node scripts/build-frontend.js   # builds frontend/index.html
# then open frontend/index.html in any browser
```

### Testnet deploy (needs a faucet claim — free test OKB, no real funds)

```bash
node scripts/gen-test-key.js          # throwaway TESTNET-ONLY keypair (printed once, never saved)
# fund the printed address at https://www.okx.com/xlayer/faucet (free)
export TAPEOUT_TESTNET_KEY=<printed key>
npx hardhat run scripts/deploy.js --network xlayerTestnet
```

Never use a real wallet key here. The deploy script refuses any network except `xlayerTestnet`.

## Project layout

```
contracts/TapeLensVerifier.sol   on-chain truth-table verifier
simulator/netlist.js             builder + simulator (Node + browser, no deps)
test/TapeLensVerifier.test.js    24 Hardhat tests
scripts/readXLayer.js            live read-only X Layer snapshot
scripts/deploy.js                testnet deploy (faucet-funded only)
scripts/gen-test-key.js          throwaway testnet keypair generator
scripts/build-frontend.js        builds the single-file demo
frontend/index.template.html     demo source
frontend/index.html              built demo (open in browser)
data/xlayer-snapshot.json        verified live X Layer read
docs/RESEARCH.md                 TapeOut research + verified addresses
docs/SUBMISSION.md               paste-ready submission text
docs/DEMO_SCRIPT.md              ≤3 min demo video script
docs/STATUS.md                   status + remaining user-only steps
```

## Revenue model (for the submission)

Freemium developer tool: free verification for standard templates; paid (small OKB fee) custom-circuit verification + a "Verified" badge API for marketplaces (TapeOut Market, Firsto) and PoD dashboards; PoD-task matching (which open task a circuit solves) as a premium check. No revenue yet — allowed by the hackathon FAQ.

## Safety

No seed phrases or private keys are ever requested, stored, or used. No mainnet deployment, no funds moved, no wallet connected. The only key that ever exists is a throwaway testnet-only key generated locally for the faucet-funded testnet deploy.
