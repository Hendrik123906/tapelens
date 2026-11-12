# TapeOut Accelerate — submission text (paste-ready)

> Fill the Google Form linked from https://web3.okx.com/xlayer/build-x-series before 7 Dec 2026 23:59 UTC. Fields below map to what the form/rules ask for. Replace [BRACKETS] only if the testnet deploy or repo link changes. Do NOT claim anything marked ⏳ as done.

## Project name

**TapeLens — Circuit Verifier for TapeOut on X Layer**

## One-line description

TapeLens proves what a TapeOut circuit actually does: it re-evaluates any NAND netlist for every input combination and verifies it against the claimed truth table — on-chain, so marketplaces, PoD miners, and buyers can trust a Circuit NFT before they pay for it.

## Product / service

A TapeOut circuit is a netlist of NAND gates (+ LATCH cells) minted as a Circuit NFT, and a verified circuit can become a PoD mining machine earning $BEM. Today that purchase is blind — nothing on chain proves the circuit implements the logic it claims. TapeLens closes that gap:

1. **TapeLensVerifier smart contract** (`contracts/TapeLensVerifier.sol`): submit a NAND netlist + claimed truth table; the contract re-evaluates the netlist for EVERY input combination and reverts unless it matches exactly. On success it records `verified[keccak256(netlist)] = true` and emits `CircuitVerified`. Pure logic — no owner, no funds, no token, no upgradeability.
2. **In-browser simulator + netlist builder** (`frontend/index.html`, single static file): four working templates — Half Adder (5 NAND), Full Adder (13 NAND), 2-to-1 MUX (8 NAND), 2-bit Multiplier (18 NAND) — with gate list, full truth-table simulation, netlist hash, and the exact calldata for the on-chain call. Plus an interactive SR-LATCH demo (TapeOut's memory primitive) and a live X Layer data panel. No wallet, no server.
3. **Live X Layer reader** (`scripts/readXLayer.js`): read-only `eth_call`s against the public OKX RPC — factory, processors, $BEM supply. Verified snapshot included.

## Target users & how to reach them

- **Circuit buyers & PoD miners** (the ~15k wallets in the TapeOut ecosystem): they verify before buying/mining. Reach them via TapeOut Market / Firsto listings ("Verified by TapeLens" badge), the TapeOut Telegram/X community, and tapeout.work.
- **Circuit designers**: they prove their design is correct before tape-out. Reach them via the TapeOut Canvas community and builder channels.
- **Marketplaces & PoD dashboards**: they integrate the one-read `verified[hash]` check. Direct outreach to marketplace operators.

## Revenue model & why users pay and keep using it

Freemium developer tool. Free: verification of standard templates + read-only checks. Paid (small OKB fee per call): custom-circuit verification and a "Verified" badge API for marketplaces and PoD dashboards. Premium: PoD-task matching — which open PoD task a given circuit solves. Users keep paying because every unverified circuit is a financial risk: one wrong purchase costs far more than one verification, and miners stake real component value on circuits being what they claim. (No revenue yet.)

## TapeOut ecosystem usage

- **On-chain data on X Layer (chain 196):** reads the live TapeOut factory `0x1f09daefa827f02cbb40967cc91b259763760761` (416 processors, verified by `cpuCount()`), live processors (e.g. `0x839bdD6fa7A66416A609A735e11DE5411B98574e`, 103 circuits via `nextId()`), and $BEM on X Layer `0x60e62efa9405d6873c5deabd4e6cc91c25363952` (15,090.34 BEM, 8 decimals). Full snapshot: `data/xlayer-snapshot.json` (12 Nov 2026, block 75,695,624).
- **Existing TapeOut processors/circuits:** TapeLens verifies circuits from ANY TapeOut processor instead of launching another one — explicitly allowed by the FAQ.
- **DeWEB-ready:** the demo is a single static file with no server, publishable as a `tape://` site via TapeKit/TapeCode.
- **Mechanism:** supports PoD — a verified circuit is the precondition for trustworthy PoD mining registration.

## Links & addresses

- Demo (static site, open in browser): `frontend/index.html` in the repo [⏳ PUBLIC LINK: publish the repo + host the file, or deploy via Vercel/Netlify — add URL here before submitting]
- Repo: https://github.com/Hendrik123906/tapelens
- TapeOut factory (X Layer): `0x1f09daefa827f02cbb40967cc91b259763760761`
- $BEM (X Layer): `0x60e62efa9405d6873c5deabd4e6cc91c25363952`
- TapeLensVerifier contract: [⏳ X Layer testnet address after `scripts/deploy.js` — add here; until then state "tested locally, testnet deploy pending"]
- Demo video (≤3 min, recommended): [⏳ ADD LINK — script in `docs/DEMO_SCRIPT.md`]

## What was built during the event (all new, Nov 2026)

Entire project is new: contract, simulator, 24 Hardhat tests, X Layer reader, single-file demo, docs. Nothing is reused from an earlier project.

## Team

Solo builder (individual, 18+). Contact: bambanghendri71@gmail.com.
