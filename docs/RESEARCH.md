# TapeOut research — verified findings (12 Nov 2026)

Sources: official OKX event page, TapeOut official site, independent on-chain terminal tapeout.work (reads contracts directly), community guides. All contract addresses below were verified by live `eth_call` reads or by the terminal's on-chain readers — not copied from marketing copy.

## What TapeOut is

- **On-chain hardware manufacturing protocol.** Started by developer Blonskr, launched 15 Aug 2026 on BNB Chain, now also on **X Layer** and Base.
- **Primitives:** `NAND` (logic) and `LATCH` (state/memory) components issued as ERC-1155 assets.
- **Canvas → tape-out:** users connect components on a browser canvas; "tape-out" burns the components and mints a **Circuit NFT (ERC-721)** recording the circuit's netlist. Circuits are transferable, composable (a circuit can be used as a black-box module by other developers), and invocable.
- **Layers:** components (NAND/LATCH) → Circuits → Processors/machines/apps. First proof point: **Behemoth**, a 4-bit on-chain CPU.
- **Proof of Design (PoD):** the protocol publishes circuit tasks with defined input/output requirements. A circuit that passes verification can be registered as a **mining machine** and earns **$BEM** (21M total supply, launched 21 Aug 2026 on BNB Chain).
- **Ecosystem tools:** TapeHub (token/mining launchpad), **TapeKit** (open-source DeWEB browser kernel — websites served from on-chain containers, `tape://`), **TapeSend** (encrypted messaging, TAP-10), **TapeCode** (DeWEB build/deploy/audit tool), **FabX** (winner of the first TapeOut Genesis Transistor Hackathon — circuit design + tape-out + PoD + DeWEB), TapeOutScan explorer, Firsto/TapeOut Market.
- **Honesty note:** the protocol is ~3 months old, contracts were still upgradeable (3/5 multisig) at last public disclosure, and $BEM liquidity is shallow. TapeLens does not touch $BEM economics; it only verifies circuit logic.

## X Layer (OKX L2, EVM, chain id 196)

Verified live on 12 Nov 2026, block 75,695,624, via public RPC `https://rpc.xlayer.tech` (see `data/xlayer-snapshot.json`):

| Item | Address | Verified fact |
|---|---|---|
| TapeOut factory (X Layer) | `0x1f09daefa827f02cbb40967cc91b259763760761` | Has code; `cpuCount()` = **416 processors** |
| Processor #0 | `0x839bdD6fa7A66416A609A735e11DE5411B98574e` | `nextId()` = 103 circuits |
| Processor #1 | `0x0565EA48CA41Ae559d8d491dbb0a9ec945DB551b` | `nextId()` = 100 circuits |
| Processor #2 | `0xE0EF4FffD869cBD24b2F83E6d2d83109937E05ff` | `nextId()` = 25 circuits |
| BEM on X Layer | `0x60e62efa9405d6873c5deabd4e6cc91c25363952` | name `BEM`, symbol `BEM`, decimals 8, totalSupply **15,090.34488200 BEM** (growing; bridge-verified 1:1 backing on BNB) |
| Rig voucher (X Layer) | `0x9cfc959cd42b2e1d39a0d850c528210e818ae520` | totalSupply **15** (matches the bridge terminal's 15 vouchers outstanding) |

Terminal cross-check (tapeout.work, 12 Nov 2026): X Layer = 416 processors, 11,755 circuits, read hourly from the factory on chain. BEM bridge: BSC BEM `0x5ce033b2bfca3af30b3e8c8457deaf776a8b695a`, bridge lock side `0xa84b8d3893de6e9922f2b29be1e1b115845f5e72`, backing matched at last check.

## Hackathon rules (official OKX page, https://web3.okx.com/xlayer/build-x-series)

- **Prize:** 100,000 USDT — 1st 20,000 ×1, 2nd 10,000 ×5, 3rd 6,000 ×5. Pool may grow. **Payout is milestone-based** (paid in stages as winners work with X Layer/TapeOut); winners must pass **identity verification** and provide a self-custodial wallet. Shortlisted teams attend an offline Demo Day (costs are the team's).
- **Deadline:** 7 Dec 2026 23:59 UTC (= 8 Dec 06:59 WIB). Provisional — the event page confirms the final date.
- **Eligibility:** 18+ (or local age of majority); solo **and** teams welcome; existing projects allowed **only with substantial new development during the event** (only that work is judged); Restricted Persons under X Layer ToS ineligible.
- **Requirements:** build in the TapeOut ecosystem and use TapeOut circuits, contracts, or on-chain data on X Layer, **or** run on X Layer DeWEB. Directions: apps, games, online services, developer tools, circuit design, PoD mechanisms. Description must explain product, target users + how to reach them, revenue model, and why users pay/keep using it. Circuit projects submit processor contract address + circuit ID; apps/tools provide an access link + which TapeOut ecosystem features they use.
- **FAQ (important):** interfaces/computation may run **outside** circuits; you **may** use existing TapeOut processors, circuits, and tools; no revenue yet is fine; only the interface need not be on chain — but the TapeOut usage must be on X Layer with real addresses.
- **Judging:** user value & commercial potential; innovation; ecosystem integration (DeWEB, FabX, TapeCode, TapeKit, TapeSend — none specifically required); product readiness & UX; demo video recommended ≤ 3 min (problem, core features, users + business model, TapeOut usage).
- **Submit:** through the submission form (Google Form linked from the Build X page) before the deadline. **The direct form URL was not exposed in the page text crawl** — it must be clicked from the event page (user/parent step, needs browser + login).

## Why TapeLens fits

- Developer-tool direction (explicitly eligible) + circuit design; uses **live TapeOut on-chain data on X Layer** (factory/processors/BEM) and **existing processors/circuits** (FAQ-allowed); static single-file frontend is **DeWEB-ready**; honest about what is deployed vs local-tested; no revenue yet (FAQ-allowed).
