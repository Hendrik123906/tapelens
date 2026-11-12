# TapeLens — status akhir (12 Nov 2026, ~13:30 WIB)

Proyek: **TapeLens — Circuit Verifier for TapeOut on X Layer**, di `~/workspace/bounties/tapeout/`.
Repo RozgarAI TIDAK disentuh.

## ✅ SELESAI & TERVERIFIKASI

| # | Item | Bukti |
|---|---|---|
| 1 | Riset TapeOut + aturan hackathon | `docs/RESEARCH.md` — dibaca dari halaman resmi OKX + tapeout.net + terminal on-chain tapeout.work |
| 2 | Kontrak `TapeLensVerifier.sol` | Compile OK (Hardhat 2.26, Solidity 0.8.24, evm paris) |
| 3 | 24/24 Hardhat tests lolos | `npx hardhat test` — 24 passing, 2 detik. Mencakup: 4 template (sim JS = referensi, evaluate on-chain = referensi, hash JS = hash Solidity, verify sukses + event, verify gagal saat truth table diubah), hash salah, referensi gate invalid, output node invalid, netlist kosong |
| 4 | Simulator JS murni | `node` langsung: 4 template SIM-OK (Half Adder 5 gate, Full Adder 13, MUX 8, Multiplier 2-bit 18); SR-LATCH SET/RESET benar |
| 5 | Data X Layer LIVE (mainnet 196) | `data/xlayer-snapshot.json` — 12 Nov 2026 06:23 UTC, block 75.695.624: factory `0x1f09…` (416 prosesor), 5 prosesor pertama + nextCircuitId (103/100/25/9/11), BEM `0x60e6…` (15.090,34488200 BEM, 8 desimal), rig voucher supply 15 |
| 6 | Frontend demo single-file | `frontend/index.html` (25.854 byte, hasil `scripts/build-frontend.js`) — template picker, tabel gate, truth table, hash keccak, panel data X Layer + refresh live, demo SR-LATCH, calldata verify |
| 7 | Materi submission | `docs/SUBMISSION.md` (siap paste), `docs/DEMO_SCRIPT.md` (naskah video ≤3 mnt), `README.md` |
| 8 | Keamanan | Tanpa seed/private key user; tanpa wallet; tanpa mainnet; tanpa dana. Satu-satunya key yang pernah dibuat adalah key throwaway testnet-only — file-nya sudah di-shred, tidak tersimpan di repo |

## ⏳ BELUM SELESAI — butuh langkah user/parent (bukan blocker build)

1. **Deploy testnet (X Layer testnet, chain 195)** — script siap (`scripts/deploy.js`, hanya mau jalan di `--network xlayerTestnet`). TERBLOKIR, terkonfirmasi 2x (12 Nov ~13:26 & ~13:30 WIB): RPC testnet `testnet-rpc.xlayer.tech` tidak bisa dijangkau dari VM ini (sekali proxy-tunnel error, sekali timeout 20 detik); RPC mainnet `rpc.xlayer.tech` normal di saat yang sama. Jadi bukan sekadar faucet: deploy harus dijalankan dari mesin/jaringan yang bisa mencapai RPC testnet, ATAU dicoba ulang lain waktu. Langkah HP user tetap: klaim OKB testnet gratis di https://www.okx.com/xlayer/faucet (halaman faucet terverifikasi ada) ke alamat throwaway baru, lalu deploy. Kontrak sendiri SUDAH teruji penuh di local chain; yang kurang hanya alamat deploy-nya.
2. **Repo publik + hosting demo** — buat repo GitHub baru untuk folder ini + hosting file statis (Vercel/Netlify gratis) agar form submission punya link repo & link demo. Isi URL-nya ke `docs/SUBMISSION.md` (bagian [⏳]).
3. **Submit form** — Google Form yang ter-link dari https://web3.okx.com/xlayer/build-x-series. URL form langsung tidak muncul di crawl halaman; harus diklik dari halaman event (butuh browser + login user). **Deadline 7 Des 2026 23:59 UTC = 8 Des 06:59 WIB.** Jangan klaim submit sebelum form benar-benar terkirim.
4. **Video demo ≤3 menit** — rekomendasi, TIDAK wajib. Naskah siap; rekam layar demo + `npx hardhat test`, upload unlisted YouTube, tempel link.
5. **(Opsional, setelah menang)** — verifikasi identitas + wallet self-custodial untuk payout; payout milestone-based, bukan langsung cair penuh.

## Catatan jujur untuk submission

- Yang diklaim HANYA yang terverifikasi di atas. ✅ TapeLensVerifier SUDAH DEPLOY di X Layer testnet 12 Nov 2026 ~17:48 WIB: `0x1f3d1411b0B488BFBb5B7C6B3C0920785f34115A`, tx `0xca2f3cc10693d3dd5a5a75756d31125f92d9326d8ada4854febb06642ea0ae2d` (kode 5.345 byte terverifikasi on-chain via testrpc.xlayer.tech). TIDAK ada pernyataan palsu.
- Proyek 100% baru, dibuat selama event (Nov 2026) — memenuhi syarat "substantial new development".
- Solo, 18+ (user lahir 7 Des 1997), email bambanghendri71@gmail.com.

## ✅ Repo lokal SIAP PUSH (12 Nov 2026 ~14:05 WIB)

- Git init + commit `4f8e844` (19 file; node_modules/artifacts/cache ter-exclude; tree terverifikasi bebas secret/key; 24/24 Hardhat test lolos ulang saat commit).
- ⛔ Push TERBLOKIR: token `gh` (fine-grained PAT) tidak punya izin `createRepository` → repo `Hendrik123906/tapelens` tidak bisa dibuat dari VM. Butuh: user buat repo kosong `tapelens` (public) di github.com, ATAU tambah izin repo ke PAT / `gh auth refresh -s repo`. Setelah repo ada: `git remote add origin https://github.com/Hendrik123906/tapelens.git && git push -u origin main`.
- ⛔ Hosting TERBLOKIR: Vercel belum login (`vercel status` → `not_connected`, tidak ada token di config). Butuh user login Vercel (authorize URL) — jangan buat akun baru tanpa user. Setelah login: deploy `frontend/index.html` → `vercel deploy --prod`, isi URL demo ke `docs/SUBMISSION.md`.
- Placeholder [⏳] di `docs/SUBMISSION.md` (URL repo + URL demo) MASIH kosong — diisi setelah kedua blocker di atas teratasi. Jangan isi URL tebakan.
