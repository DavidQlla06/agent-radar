# DEPLOY_OPTIONS.md — Binance Agent ID Hackathon: how to deploy from the user's wallets

Research date: 19 Nov 2026 (~13:10 WITA). Researcher role: READ-ONLY (no deploying, signing, spending, submitting).
`baw` CLI inspected: v1.12.0, installed fresh on this VM via `npm install -g @binance/agentic-wallet`. No sign-in/pairing performed.

## TL;DR

- **The Agentic Wallet (davidganteng.ai, 0x80274E1D4738C03051fFa3d32b2286a0dfD70D41) CANNOT deploy a contract.** `baw` has no deploy command, and its only contract tool (`contract-call`) requires an existing contract address (`--to` is mandatory for EVM). There is no WalletConnect / injected-provider / seed export for the Agentic Wallet.
- **Recommended path: Remix IDE + the user's regular Binance Web3 Wallet (MPC wallet) via WalletConnect** (or the in-app dApp browser). Both halves of this path are documented by the vendors. Blocker: the MPC wallet's address and BNB balance are unknown — must be checked in the Binance app.
- **Deploying from a different wallet than the Agent ID holder is allowed by the rules.** Nothing in the announcement requires the deployer address to hold the Agent ID. The contract only needs to *use* Agent ID (e.g. `balanceOf` on the Agent ID contract). So the deployer can be the MPC wallet or a fresh EOA.
- **Gas is nearly free right now, but the Agent ID wallet's balance is exactly at the edge.** Live BSC gas price at check time: **0.05 gwei**. A minimal deploy (300–500k gas) costs **0.000015–0.000025 BNB**; a typical small contract (1–1.5M gas) costs **0.00005–0.000075 BNB**. The Agent ID wallet holds **0.00002516 BNB** (verified on-chain) — enough for ~503,200 gas at 0.05 gwei, i.e. only a very small contract and only if gas stays at 0.05 gwei. A top-up of ~0.001–0.002 BNB would make any deploy safe. (Gas price fluctuates: at 1 gwei, 1M gas = 0.001 BNB = 40× the current balance.)
- **Mainnet BSC is required in practice** (see §5). Testnet does not count.
- **BscScan does not deploy contracts** — it only verifies source code after deployment. Verification itself is free.

## 0. Verified facts about the user's wallets

| Item | Value / status |
|---|---|
| Agent ID wallet (Agentic Wallet) | `0x80274E1D4738C03051fFa3d32b2286a0dfD70D41`, Agent ID `davidganteng.ai` |
| Agent ID `balanceOf` on-chain | **1** — verified via `eth_call` to Agent ID contract `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (contract has code on BSC mainnet, verified live 19 Nov) |
| Agent ID wallet BNB balance | **0.00002516 BNB** (25,160,000,000,000 wei, `eth_getBalance`, verified live 19 Nov) |
| Second Agent ID vefrikilla #19399 | `0xcb1ad318a05c3dbf21340628dc8d1fc8f4d91e6d` (from brief; balance not re-checked) |
| Regular Binance Web3 Wallet (MPC) | Address and BNB balance **UNKNOWN** — user must check in Binance app (Wallet → Web3). Per third-party guides, having the MPC wallet is a prerequisite for creating an Agentic Wallet, so it very likely exists. |
| Live BSC gas price | **0.05 gwei** (50,000,000 wei, `eth_gasPrice` via `https://bsc-dataseed.binance.org/`, 19 Nov 05:10 UTC). Block ~0x803778f. |

## 1. `baw` CLI inspection (v1.12.0) — full command list

Top-level commands (`baw --help`):

```
skill-check, cli-check, auth, wallet, market-order, limit-order, x402-payment,
prediction, approvals, defi, signal, tracker, leaderboard, contract-call,
sign-message, help
```

`baw wallet` subcommands: `status, address, balance, send, cancel, speed-up,
tx-history, settings, left-quota, tx-lock, chains, gas-price, resolve-domain, agent-id`

`baw contract-call` subcommands: **`preview`, `execute` only.**

`baw contract-call preview --help` (exact options):
- `--binanceChainId <id>` (e.g. 56 for BSC)
- `--from <address>` — Agentic wallet address; backend verifies ownership
- `--to <address>` — **"Contract address to interact with (EVM only, required for EVM)"**
- `--value <wei>`, `--inputData <hex>` (0x-prefixed calldata), `--gasLimit <n>` (21,000–15,000,000)
- `execute` takes only `--requestId <id>`

**Verdict: no deploy capability.** There is no `deploy`, `create-contract`, or
contract-creation command anywhere in the CLI. A contract-creation transaction
has NO `to` field, and `contract-call preview` makes `--to` mandatory for EVM,
so it cannot be (ab)used to deploy. `baw wallet send` only sends tokens
(`--amount/--max --recipient --tokenAddress --gasLevel --binanceChainId`).
`baw wallet chains` / `gas-price` require login (`[10003002] Please log in first.`).
No sign-in was attempted (out of scope for this research task).

## 2. Deploy options, ranked

### Option A — RECOMMENDED: Remix IDE + regular Binance Web3 Wallet (MPC) via WalletConnect
**Status: VERIFIED as supported by vendor docs (both sides); end-to-end with the user's own MPC wallet NOT yet tested — needs the user in-app.**

Why it works:
- Binance Web3 Wallet supports **WalletConnect v2 and EIP-1193 injected provider** — official Binance developer docs: "Binance Web3 Wallet supports standard connection methods including WalletConnect v2 and EIP-1193 injected provider. If your DApp already supports WalletConnect or injected wallets, it works with Binance Web3 Wallet out of the box." Source: `https://developers.binance.com/docs/binance-w3w/introduction`. Inside the Binance app's dApp browser, `window.binancew3w.ethereum` is available as an EIP-1193 provider.
- Remix IDE supports a **WalletConnect environment** — official Remix docs (`https://remix-ide.readthedocs.io/en/latest/run.html`): "Set the ENVIRONMENT to WalletConnect. A QR code will appear, scan it with your mobile wallet app… Remix will then use your mobile wallet's accounts and selected network." Remix also supports a Browser Extension environment.
- This is the **regular MPC wallet, NOT the Agentic Wallet**. The Agentic Wallet is a separate, isolated wallet with no WalletConnect/injected provider; it cannot be connected to Remix. Do not confuse the two.

Exact steps (for the user / frontend team, on the user's Windows PC + phone):
1. In the Binance app, check the regular Web3 Wallet's BSC address and BNB balance (Wallet → Web3). Top up with a small amount of BNB if needed (a few thousandths of a BNB is ample — see gas table §4).
2. On the PC, open `https://remix.ethereum.org`, compile the contract (Solidity Compiler tab, note exact compiler version + optimizer settings — see §6).
3. Deploy & Run Transactions tab → Environment → **WalletConnect**. A QR code appears.
4. In the Binance app, scan the QR with WalletConnect (or open Remix inside the Binance app's dApp browser and use the injected provider instead).
5. Select network **BNB Smart Chain (chainId 56)** in the wallet, confirm the account shown in Remix is the MPC wallet address.
6. Select the contract, fill constructor args if any, click **Deploy**, approve the transaction in the Binance app.
7. Record: contract address, tx hash, deployer address, block number, compiler version, optimizer runs, EVM version, constructor args (see §6).

Caveats / unknowns:
- Whether the Binance app's WalletConnect flow will surface a contract-creation transaction for approval is **plausible but not yet proven with this wallet** — it is a standard `eth_sendTransaction` with no `to`, which wallets normally support, but it has not been tested live with the Binance MPC wallet. If WalletConnect approval fails, fallback is the in-app dApp browser (injected provider).
- The MPC wallet's BNB balance is unknown; if it is also ~0, a top-up is needed (user decision).

### Option B — Fresh EOA (MetaMask / new wallet) funded with a tiny amount of BNB
**Status: VERIFIED standard path (Remix injected-provider docs); needs the user's explicit approval to create/fund a wallet — DO NOT create one without it.**

Steps: create a new MetaMask (or any EOA) wallet on the user's PC → add BSC network (chainId 56, RPC `https://bsc-dataseed.binance.org/`) → fund with ~0.002 BNB from Binance/another wallet → Remix → Environment "Browser Extension" (Injected Provider) → Deploy → approve in MetaMask → record deploy details (§6).
- Pros: fully standard, no dependence on Binance app quirks; deployer key is exportable; cheapest friction for the contract team.
- Cons: new wallet + key management; funding it requires a transfer (Binance spot withdrawal minimums may apply — **unverified**, check at withdrawal time); the deployer is a new address with no Agent ID (allowed — see §0, deployer need not hold an Agent ID).
- Cost: same gas as Option A (§4).

### Option C — `baw` / Agentic Wallet deploy
**Status: VERIFIED IMPOSSIBLE with baw v1.12.0.** See §1. No deploy command; `contract-call` requires `--to`. Do not spend more time on this path unless a future `baw` release adds deployment. (Note: the Agentic Wallet CAN interact with the contract *after* deployment via `baw contract-call preview/execute` with DevMode — useful for demos and for Agent ID-holder interactions from davidganteng.ai.)

### Option D — "Deploy via BscScan"
**Status: DOES NOT EXIST — misconception corrected.** BscScan is a block explorer + source-code verifier. It has no contract-deployment function. Deploy with Remix/Hardhat/Foundry, then verify on BscScan (§6).

### Option E — Emergency export of the MPC wallet private key → MetaMask → deploy
**Status: PLAUSIBLE per third-party guides only; NOT verified from official Binance docs; NOT RECOMMENDED.**
- Third-party guides (e.g. CoinVado 2026 Binance Web3 Wallet guide) report an "emergency export" feature: export the MPC wallet as a standard private key. They warn it is **irreversible** — after export the Binance wallet can no longer be used, keyless recovery is lost, and **some campaign eligibility may be lost**.
- Because eligibility loss is explicitly warned and the hackathon is the whole point, this option should only be considered if Options A and B both fail, and only with the user's explicit, informed approval. It is listed here for completeness, not as a recommendation.

## 3. What the deployer address does / does not need

- The announcement does **not** require the deploying address to hold an Agent ID.
- Requirements that touch addresses: (a) the project must actively use Agent ID; (b) only submitted contract addresses are counted; (c) interacting addresses must hold an Agent ID (checked via `balanceOf` on `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`).
- Practical consequence: the contract should gate its Agent ID features on `IAgentID.balanceOf(user) > 0`, and the team should drive ≥30 distinct Agent ID holders to interact during the Submission Period (Innovation Award eligibility bar). The deployer can be any funded address.

## 4. Gas cost (live numbers, 19 Nov 2026 ~13:10 WITA)

Live BSC gas price: **0.05 gwei** (`eth_gasPrice` = 50,000,000 wei).

| Gas used | Cost @ 0.05 gwei | Share of 0.00002516 BNB balance |
|---|---|---|
| 300,000 (very small contract) | 0.00001500 BNB | 60% |
| 500,000 | 0.00002500 BNB | 99% — entire balance |
| 800,000 | 0.00004000 BNB | 159% — NOT affordable |
| 1,000,000 (typical small contract) | 0.00005000 BNB | 199% — NOT affordable |
| 1,500,000 | 0.00007500 BNB | 298% — NOT affordable |
| 2,000,000 | 0.00010000 BNB | 398% — NOT affordable |

- Max gas affordable from the Agent ID wallet right now: **~503,200 gas** at 0.05 gwei.
- Sensitivity: BSC gas price moves. At 1 gwei, 1M gas = 0.001 BNB (40× the current balance). At 0.1 gwei, 1M gas = 0.0001 BNB (4× the balance).
- **Recommendation: fund the deployer wallet with ~0.002 BNB** (≈ enough for a 1.5M-gas deploy even at ~1 gwei, plus several interaction/verification txs). This is trivial gas by the user's "free only, gas fine" rule, but the top-up itself needs his go-ahead.
- BscScan source verification is **free** (no gas, no fee) — it is an off-chain form/API call.

## 5. Mainnet vs testnet

- Announcement: "Participating projects must have deployed smart contracts on BNB Chain with source code verified and open-sourced on BscScan." No testnet is mentioned anywhere; BscScan verification implies BSC mainnet (testnet explorer is a separate site).
- The Agent ID contract `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` exists **only on BSC mainnet** (verified code + `balanceOf` = 1 for the user's wallet, checked live). There is no Agent ID on BSC testnet, so testnet interactions could never produce "interacting Agent ID addresses" and could never count toward either award.
- **Conclusion: deploy on BSC mainnet (chainId 56). Testnet does not count.** This is a strong inference from the rules + on-chain facts, not an explicit sentence in the announcement — but there is no plausible reading under which testnet counts.

## 6. BscScan verification — what the contract team must record at deploy time

Verification is mandatory ("complete source code verification on BscScan, and make the code publicly open-source"). If any of these are lost, verification becomes guesswork:

Record at deploy time (exact values, no approximations):
1. **Contract address** + deploy tx hash + block number + deployer address.
2. **Compiler version** — exact, including commit hash (e.g. `v0.8.20+commit.a1b79de6`). Must match the version used to compile the deployed bytecode.
3. **Optimization: enabled/disabled + runs** (e.g. `Yes with 200 runs`). Default in Remix is 200 runs; Hardhat/Foundry defaults differ — record what was actually used.
4. **EVM version** (e.g. `paris`, `cancun`, `default`). Must match compilation.
5. **License type** (SPDX identifier, e.g. MIT) — shown on BscScan as "Other Settings".
6. **Constructor arguments** — ABI-encoded hex appended to the deployment bytecode (BscScan auto-detects them from the tx input data, but keep a copy: the decoded values + the raw hex).
7. **Exact source code** — for multi-file projects, verify with **Standard JSON Input** (all files + compiler settings in one JSON) or flattened source; import paths must resolve exactly as compiled. Keep the exact `solc` input JSON / Hardhat/Foundry artifacts.
8. **Proxy note**: if the project uses a proxy (e.g. OpenZeppelin Transparent/UUPS), the proxy AND the implementation must each be verified; BscScan shows proxy contracts separately. Prefer a single non-proxy contract for this hackathon to keep verification trivial.
9. **Owner permissions disclosure** (safety red line): any owner-only powers — minting, pausing, tax/fee changes, freezing, withdrawing funds — must be clearly documented in the project description/README, not just in code.

Verification route: BscScan contract page → "Verify and Publish" (or the `Verify Contract` API). Free. After verification, confirm the page shows "Contract Source Code Verified (Exact Match)" and the source is publicly readable.

## 7. Blockers — exact list for the parent agent / user

| # | Blocker | Needed from whom |
|---|---|---|
| 1 | **No deploy path from the Agentic Wallet.** `baw` cannot deploy; Agentic Wallet has no WalletConnect/seed. | Decision: use Option A (MPC wallet) or B (fresh EOA). |
| 2 | **MPC wallet address + BNB balance unknown.** | User: check in Binance app (Wallet → Web3 → BNB Smart Chain). |
| 3 | **Gas funding.** Agent ID wallet (0.00002516 BNB) can afford at most ~503k gas at current 0.05 gwei — likely not enough for a real contract. | User go-ahead to top up the deployer wallet with ~0.002 BNB (trivial gas, but his call). |
| 4 | **Fresh EOA (Option B) needs explicit approval** to create/fund a new wallet. | User approval. Do not create without it. |
| 5 | **Project submission form URL not published in the announcement** (see SUBMISSION_RESEARCH.md). No project can be submitted until Binance publishes the form/link (or it is found in-app). | Parent agent: live-browser check / monitor announcement for the form. |
| 6 | **30 Agent ID interactions** needed for Innovation Award eligibility — a distribution/adoption task, not a deploy task, but it must be planned now (the Submission Period clock is already running). | Team: design a reason for 30+ Agent ID holders to interact before 9 Dec. |

## Sources

- Announcement (fetched 19 Nov 2026): https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
- `baw --help`, `baw wallet --help`, `baw contract-call preview/execute --help` — @binance/agentic-wallet v1.12.0, inspected on this VM 19 Nov 2026 (no sign-in).
- BSC mainnet RPC `https://bsc-dataseed.binance.org/` — `eth_gasPrice`, `eth_getBalance`, `eth_call` (Agent ID `balanceOf`), `eth_getCode`, 19 Nov 2026 05:10 UTC.
- Binance Web3 Wallet dev docs (WalletConnect v2 + EIP-1193): https://developers.binance.com/docs/binance-w3w/introduction
- Remix Deploy & Run docs (WalletConnect + Browser Extension environments): https://remix-ide.readthedocs.io/en/latest/run.html
- Agentic Wallet keyless/MPC, no private key (third-party guide): https://monsterblockhk.com/en/binance-agentic-wallet-guide/ ; MPC emergency-export warning (third-party guide): https://coinvado.com/en/posts/binance-web3-wallet-guide-2026/
