# Demo video script — TapeLens (≤ 3 minutes, recommended not required)

Target: ~2 min 30 s. English narration (event is international), screen recording of `frontend/index.html` + terminal. No AI video generation (blocked) — record the real screen.

## 0:00–0:20 — The problem
> "TapeOut turns digital circuits into NFTs. A circuit that passes verification can mine BEM. But today, buying a circuit is blind — nothing on chain proves what logic it actually implements. A mislabeled circuit can be sold as the real thing. TapeLens fixes that."

Visual: tapeout.net + an OKLink processor page.

## 0:20–1:00 — The product: verify in the browser
> "Pick a circuit — here, a Full Adder, the building block of every CPU. TapeLens shows its NAND netlist: 13 gates. It simulates all eight input combinations in your browser and checks them against the claimed truth table. Every row matches. Then it computes the netlist hash — the fingerprint the contract records."

Visual: click Full Adder in the demo; scroll gate list + truth table; hash appears.

## 1:00–1:40 — The proof: on-chain
> "The same netlist goes to the TapeLensVerifier contract on X Layer. It re-evaluates the circuit for every input combination on chain. If one row is wrong, it reverts. If all match, the hash is recorded as verified — one read call for any marketplace or miner to check. Here are the 24 Hardhat tests, all passing."

Visual: terminal `npx hardhat test` (24 passing); contract code scroll; OKLink factory page (416 processors).

## 1:40–2:15 — Live X Layer data
> "TapeLens reads TapeOut live on X Layer — the factory, processors, and the BEM supply — with read-only calls. No wallet, no signing, no funds. And the whole demo is a single static file, ready to publish on DeWEB as a tape:// site."

Visual: X Layer panel in the demo; click "Refresh live"; SR-LATCH demo (SET/HOLD).

## 2:15–2:30 — Users & business
> "Users are circuit buyers, PoD miners, and marketplaces. Free to check, paid for custom verification and a Verified badge API. TapeLens: don't trust the label — verify the circuit."

Visual: closing slide with project name + links.

## Recording checklist
- [ ] Record screen at 1080p, browser zoom 100%, demo open at `frontend/index.html`
- [ ] Run `npx hardhat test` once on camera (or show the passing output)
- [ ] Keep it under 3:00; export mp4; upload unlisted to YouTube; paste link in SUBMISSION.md
