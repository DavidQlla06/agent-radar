# Agent Radar — Binance Agent ID Hackathon Plan

## Concept
**Agent Radar** is an on-chain, Agent ID-gated curation board for pre-token DeFi protocols.

- Any wallet holding a SPACE ID Agent ID (`name.ai`, ERC-721 `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` on BSC) can **submit a signal**: a pre-token protocol (name, DefiLlama slug, ≤280-char thesis).
- Other Agent ID holders **upvote / downvote** signals. One signal per agent per protocol; one vote per agent per signal (flippable).
- The frontend merges on-chain signals with **live DefiLlama TVL data** (protocol matched by slug) so voters judge size, not just hype.
- No token, no fees, no owner, no promised returns. Signals are community opinions, not financial advice.

This adapts the user's existing **Token Radar** work (his own original skill: ranks pre-token protocols from DefiLlama data, plain JS, no API key) into a live, agent-native dApp. The off-chain ranking model becomes the frontend's enrichment layer; the new on-chain layer is agent identity + curation.

## Why it fits the scoring (Innovation Award rubric, 100 pts)
| Criterion (weight) | Fit |
|---|---|
| Agent ID depth (30%) | Agent ID is the core gate: `balanceOf > 0` required for submit AND vote. No Agent ID = read-only. Identity is the product, not a badge. |
| Practicality / feasibility (25%) | One small contract + static frontend. No oracle, no custody, no backend. Deployable in an afternoon; every interaction is a plain gas-only tx. |
| Product completion (25%) | Working contract (9/9 tests, fork-verified), working frontend (connect, browse, submit, vote), live DefiLlama data. Nothing is a mockup. |
| Innovation (20%) | Agent-native curation: AI agents (which hold Agent IDs) curate pre-token opportunities for each other, on-chain, instead of trusting a central list. |

## Awards (verified from the announcement, 19 Nov)
- **Agent ID Ecosystem Pioneer Award** (on-chain metrics ranking, weighted score: interacting Agent ID addresses + tx volume + tx count; only submitted contract addresses count; interactors must hold an Agent ID): top 10 share $29,000 — 1st $10,000, 2nd $6,000, 3rd $4,000, 4th $3,000, 5th $2,000, 6th–10th $800 each. **No minimum interaction count.**
- **Agent Application Innovation Award** (judged on the rubric above): top 10 share $29,000 (same split). **Eligibility: product LIVE + ≥30 Agent ID addresses interacted with the contract(s) during the submission period.**
- **Community Promotion Award**: 20 winners × $100 USDC ($2,000 total) for original X posts about a participating project with #BinanceWalletHackathon + #AgenticWallet, link submitted via the Binance campaign survey.
- **One award max per project; one project per team.** All 20 project winners get one eligibility spot to claim a two-digit Agent ID (higher rank = priority).
- Rewards sent to the reward address given at submission, within 14 business days after public review (17–20 Dec).

## Target: Innovation Award (primary); Pioneer unlikely
- **Primary: Innovation Award.** Judged on quality; needs only 30 interactions for eligibility.
- **Pioneer (metrics) is out of reach** without a much larger user base — a niche curation board will not outrank trading/yield apps on volume/count. Not the target.
- **Community Promotion**: low-effort, worth doing (drafts in X_DRAFTS.md, NOT posted).

## The 30-interaction bar — honest assessment
Getting **30 distinct Agent ID holders** to submit/vote is the real challenge, not the code. Facts:
- Each interaction is free except gas (~100k gas ≈ 0.000005 BNB at current ~0.05 gwei — fractions of a cent). No cost barrier.
- The user already moves in agent communities: Boltbook (agent-only alpha forum), make.fun, Agent ID ecosystem. Those are exactly where Agent ID holders are.
- Realistic path (all legitimate, no fake accounts, no wash volume):
  1. Post the live dApp in **Boltbook** + agent Telegram/Discord groups the user is in, with a clear one-line ask: "submit one protocol you are watching".
  2. **X post** with the required hashtags (also doubles as the Community Promotion entry).
  3. Ask the user's existing agent contacts (make.fun / Boltbook) to try one vote — each vote counts as an interaction.
  4. Seed the board first: the user + his second Agent ID (vefrikilla #19399) submit the first signals so visitors see a live board, not an empty page.
- Honest verdict: **top-10 Innovation is reachable IF distribution hits 30 interactions** — the product is complete, original, and genuinely Agent ID-native. If distribution stalls below 30, the submission is still valid and complete but ineligible for the Innovation Award — worth submitting anyway (costs only gas, work is reusable).

## Build status (19 Nov, all three teams done)
- [x] Smart contract: AgentRadar.sol + 9/9 tests PASS + fork-verified against the real Agent ID contract (contracts team)
- [x] Frontend: static site, ethers v6, DefiLlama enrichment (frontend team; one real bug found + fixed: DefiLlama returns a bare array)
- [x] Deploy path + submission research (research team)
- [x] GitHub repo (public): https://github.com/DavidQlla06/agent-radar
- [x] X drafts: done (X_DRAFTS.md, NOT posted)
- [ ] Deploy to BSC mainnet: BLOCKED — gas top-up + deploy method (see below)
- [ ] BscScan source verification: after deploy
- [ ] Frontend hosting: needs a public URL for the submission (static hosting — TBD)
- [ ] Distribution: 30 Agent ID interactions (user-driven, after launch)
- [ ] Binance submission: NOT submitted — **no public submission form/portal URL exists yet** (see below)

## Deployment blockers (exact, measured)
- **Deploy gas (measured from receipts, anvil + BSC fork): 1,453,171 gas.** At live 0.05 gwei (19 Nov) = **0.00007266 BNB**. User balance ~0.00002516 BNB → **shortfall 0.00004750 BNB (need 2.89× current balance)**. Top-up target: **0.00008719 BNB** (deploy + 20% margin). BUT gas fluctuates: at 1 gwei deploy alone = 0.00145317 BNB; at 5 gwei = 0.00726585 BNB. **Safe top-up: ~0.002 BNB** (research team's recommendation — covers deploy + verification + test txs across gas spikes). Top-up needs the user.
- **Deploy method — Agentic Wallet CANNOT deploy (verified).** `baw` v1.12.0 has no deploy capability: `contract-call preview` requires `--to`, so it cannot send a contract-creation tx; the wallet has no WalletConnect/injected provider/seed. **Recommended path: Remix IDE + the user's regular Binance Web3 Wallet (MPC) via WalletConnect** (both sides vendor-documented; end-to-end contract-creation approval untested live with this wallet). Alternative: fresh EOA (MetaMask) funded with ~0.002 BNB — needs the user's explicit approval to create/fund a wallet. BscScan "deploy" does not exist (verification only, free). MPC private-key export is a last resort only, not recommended.
- **Deployer need not hold the Agent ID** — rules only require the contract to use Agent ID and interactors to hold one.
- **Mainnet BSC required in practice** — Agent ID exists only on mainnet; testnet interactions can never count.
- **BscScan verification** (after deploy): record exact compiler version + commit, optimizer runs, EVM version, license, constructor args; keep the solc input JSON. RPC note: `1rpc.io/bnb` intermittently rate-limits (-32001); `bsc-dataseed.binance.org` worked reliably — swap RPC at deploy time if needed.

## Submission gap (critical, needs monitoring)
**There is NO project-submission form/portal URL anywhere public.** The announcement tells teams to submit name/website/contract addresses/Agent ID usage description + "other required materials" but links to nothing. Three web searches found no official form, registration page, or campaign landing page. Before submitting, check live: the announcement page, @BinanceWallet on X, and the Binance app banner. Do NOT submit to any third-party form. The only link in the announcement is the Community Promotion survey (https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c — opens only inside the Binance app).

## Safety red lines (checked)
- No QR-code login, no stored sessions. No seed phrase / private key / API secret / pairing code collection anywhere.
- No prompts bypassing user tx confirmation; every submit/vote is a user-confirmed wallet tx.
- No scheduled/bundled transfers, no unlimited approvals (contract holds no funds, asks for no approvals).
- Contract is open-source, no owner permissions at all (immutable, no mint/tax/pause/freeze/withdraw).
- No "Binance"/"BNB" branding in the product name or UI (name: "Agent Radar"; footer line "Built for the Binance Wallet Agent ID Hackathon" only).
- No promised returns anywhere; footer states signals are opinions, not financial advice.
- Agent ID is NOT used as a lookup tool (no "look up other people's wallets by name").

## Key facts
- Hackathon: Binance Wallet + BNB Chain Agent ID Hackathon, $60,000 USDC total.
- Submission period: 2026-11-18 08:00 UTC → 2026-12-09 08:00 UTC (ends 9 Dec 16:00 WITA). Internal review 9–17 Dec, public review 17–20 Dec.
- Agent ID contract: `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (SPACE ID Agent ID, symbol AI, non-transferable ERC-721, BSC). Verified: `supportsInterface(0x80ac58cd)` = true; `balanceOf(0x8027…0D41)` = 1.
- User: gufron sadudu (GitHub DavidQlla06); davidganteng.ai = wallet `0x80274E1D4738C03051fFa3d32b2286a0dfD70D41`; vefrikilla #19399 = `0xcb1ad318a05c3dbf21340628dc8d1fc8f4d91e6d`.
- Source of concept: user's Token Radar skill (`~/workspace/makefun/token-radar-skill/`), his original work (public MIT repo token-radar-01).
- Work dir: `~/workspace/hackathon/agent-id-hackathon/` (PLAN.md, X_DRAFTS.md, SUBMISSION.md, contracts/, frontend/, research/).
