# SUBMISSION_RESEARCH.md — Binance Agent ID Hackathon: announcement facts + submission route

Research date: 19 Nov 2026 (~13:10 WITA). Source of record: the official Binance
announcement, fetched in full (277 lines) on 19 Nov 2026.
Announcement: https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
(Published 2026-11-18. Hosts: Binance Wallet + BNB Chain.)

## 1. Verified announcement facts

### Dates (all UTC; WITA = UTC+8)
| Phase | UTC | WITA |
|---|---|---|
| Submission Period | 2026-11-18 08:00 → 2026-12-09 08:00 | 18 Nov 16:00 → **9 Dec 16:00** |
| Internal Review Period | 2026-12-09 08:00 → 2026-12-17 08:00 | 9 Dec 16:00 → 17 Dec 16:00 |
| Public Review Period | 2026-12-17 08:00 → 2026-12-20 08:00 | 17 Dec 16:00 → 20 Dec 16:00 |
| Reward distribution | Within **14 business days** after the Public Review Period ends | i.e. after 20 Dec 2026 |

**Submission deadline: 9 Dec 2026, 08:00 UTC (16:00 WITA).** ~20 days remain from 19 Nov.

### Prize pool: 60,000 USDC total
| Part | Amount |
|---|---|
| Project Awards (2 awards × 29,000) | 58,000 USDC |
| Community Promotion Campaign | 2,000 USDC |
| **Total** | **60,000 USDC** |

### Award 1 — Agent ID Ecosystem Pioneer Award (metrics-based, 29,000 USDC)
- Ranking by **weighted on-chain scores**: number of interacting **Agent ID holder addresses**, transaction volume, and/or transaction count. Top 10 projects rewarded.
- "Rankings will be determined based on real on-chain data… Binance Wallet team will calculate weighted scores using metrics, such as the number of Agent ID holder addresses interacting with participating contracts, as well as the resulting transaction volume or transaction count."
- **Only contract addresses submitted by participants count (including token contracts), and interacting addresses must hold an Agent ID.**

### Award 2 — Agent Application Innovation Award (judged, 29,000 USDC)
- Judged by a panel (Binance Wallet, BNB Chain, technical/ecosystem representatives) on a **100-point system**:
  - Agent ID Application Depth — **30%** (is Agent ID genuinely in the core functionality/business flow?)
  - Practicality & Feasibility — **25%**
  - Product Completion — **25%** (product live, core features usable)
  - Innovation — **20%**
- Tie-break: if scores are equal, priority goes to depth of Agent ID integration and product completion.
- **Eligibility bar (CONFIRMED): product must already be live, with at least 30 Agent ID addresses having interacted with the participating contract(s) during the Submission Period.** This bar applies to the Innovation Award only — the Pioneer Award has no stated minimum.
- Process: eligibility review → panel scoring → result confirmation → official announcement. Panel reserves the right to solely determine final scores.

### Identical splits for both project awards (per award, top 10)
| Rank | Per project (USDC) |
|---|---|
| 1st | 10,000 |
| 2nd | 6,000 |
| 3rd | 4,000 |
| 4th | 3,000 |
| 5th | 2,000 |
| 6th–10th | 800 each |
| **Total per award** | **29,000** |

### One award per project + two-digit Agent ID perk (both CONFIRMED)
- **Each project may only receive one award** (even if it qualifies for both).
- **All 20 project-award winners (10 Pioneer + 10 Innovation) each receive one eligibility spot to claim a two-digit Agent ID.** Higher-ranking projects have priority in selection.
- Outstanding winners may also be featured on the Binance Wallet Agentic Wallet ecosystem page and included in future Agent ID ecosystem campaigns.

### Community Promotion Award — "Agent Ecosystem Promotion Award" (2,000 USDC)
- Post **original content on X** about participating projects you like/support (views, analysis, product experience, application-scenario insights).
- Must include **both hashtags: #BinanceWalletHackathon and #AgenticWallet**.
- Submit the X post link via the **official campaign survey** (see §2 — only link found).
- **20 winners share 2,000 USDC equally = 100 USDC each**, selected by Binance Wallet team on post quality.
- This is a separate, parallel track — anyone can enter it (including the team promoting its own project, though the announcement frames it as community members posting about projects they support).

### Eligibility / participation rules
- Open to all Binance Wallet users, developers, project teams; individuals and teams.
- New AND existing projects eligible. For existing projects, **only data generated during the Submission Period counts**; historical data is excluded.
- Projects must **actively use Agent ID** (use cases named: access control, payments, identity).
- Projects must have **deployed smart contracts on BNB Chain with source code verified and open-sourced on BscScan**.
- **Each team may submit one project only.**
- Each user can claim only **one Agent ID**, and it is **non-transferable**.
- Rewards are sent to the **reward receiving address provided during project submission**. Only users with an active Binance Account are eligible; rewards are NOT distributed to users who delete/deactivate their Binance Wallet/Account.
- Cheating reports: email **audit@binance.com** (or the risk reporting channel) any time from event start until the end of the Public Review Period; verified reporters receive a corresponding reward.
- Binance reserves the right of final determination on winners/rankings, and the right to interpret/modify/cancel/extend the terms at its sole discretion.

### Agent ID reference data (from the announcement, verified on-chain)
- Agent ID contract (BNB Chain): **`0x60b9262456de011f7d15a54cdd8c48baaa8b022f`** — SPACE ID Agent ID, ERC-721, symbol AI, non-transferable.
- Check whether an address holds an Agent ID: call **`balanceOf(address)`**; return > 0 means it holds one. (Verified live: `balanceOf(0x80274E1D4738C03051fFa3d32b2286a0dfD70D41) = 1`.)
- Agent ID can only be claimed inside the Binance App: Wallet → homepage banner → Agent ID.

### Safety red lines — ALL of them (violation of ANY = immediate disqualification)
1. **No web-based QR code login for Agentic Wallet.** Projects must NOT allow users to scan QR codes or enter pairing codes on third-party websites to sign in, nor store users' login sessions on servers to place orders on users' behalf.
2. **No bypassing user transaction confirmation.** For any operation involving user assets (transfers, trades, approvals), the project's skills must NOT contain prompts that attempt to bypass user confirmation. Users must see and confirm such actions themselves.
3. **No unauthorized asset transfers.** Includes scheduled collection, automatic transfers to fixed addresses, bundled extra transfers in transactions, or soliciting unlimited approvals without the user's knowledge.
4. **Contracts must be open-source with disclosed owner permissions.** Minting, changing tax rates, pausing trading, freezing assets, withdrawing user funds, etc. must be clearly documented.
5. **No impersonation of the Binance brand.** Project names, token names, domain names must not use "Binance" / "BNB" to impersonate the official brand.
6. **No collection of sensitive credentials.** Must not collect seed phrases, private keys, API secrets, or pairing codes.
7. **No promised returns.** Projects must NOT promise returns externally — terms such as "passive income" or "automatic money-making" are prohibited.
8. **Trading products must display risk warnings** on the page.
9. **Agent ID must NOT be packaged as a tool for "looking up other people's wallets by name."**
10. **Anti-manipulation:** Binance may disqualify projects showing abnormal behavior — malicious volume manipulation, illegitimate mass account registration for interactions, market manipulation, etc.

### How to participate (announcement's 4 steps, verbatim substance)
1. Refine ideas and deploy contract(s) on BNB Chain, complete source-code verification on BscScan, make the code publicly open-source.
2. Integrate Agent ID into the product for real-world use cases (access control, payments, identity).
3. Submit project name, website, contract address(es), Agent ID usage description, and other required materials during the Submission Period. **No registration needed.**
4. During the Submission Period, actively guide Agent ID holders to interact with the project contract(s).

## 2. How to submit — what is known and what is NOT

### ⚠️ CRITICAL GAP: no project-submission form/portal URL exists in the announcement
The announcement instructs teams to "submit your project name, website, contract address(es), Agent ID usage description, and other required materials during the Submission Period" — **but it contains no link, form, or portal for the project submission itself.** The only hyperlink in the entire announcement body is the Community Promotion survey (below). Three separate web searches (19 Nov) for a project-submission form, registration page, or campaign landing page found **no** official project-submission URL — only the announcement itself, a Binance Square news repost of it, and unrelated/competitor posts. A promo graphic circulating on Threads shows a "REGISTER NOW" button, but no destination URL was recoverable from text search.

**What this means:** as of 19 Nov, the project submission route is **UNVERIFIED**. Possibilities (in order of likelihood):
1. Binance will publish the submission form/link later in the Submission Period (the campaign only opened 18 Nov), possibly via a follow-up announcement, X post from @BinanceWallet, or an in-app banner.
2. The form lives in the Binance app / a Binance survey link not yet indexed — check the Binance app's hackathon banner and @BinanceWallet on X.
3. Submission may be via the same survey system as the community award (different survey ID) — not yet found.

**Action for parent agent:** needs a live-browser check (announcement page rendered, Binance Square, @BinanceWallet X feed, Binance app hackathon banner) and/or monitoring for a follow-up announcement. Do NOT submit anything to any third-party form claiming to be the submission portal — only a link published by Binance counts.

### What a submission will need (from the announcement — confirmed fields)
- Project name
- Website (URL)
- Contract address(es) — all addresses to be counted (including token contracts)
- Agent ID usage description (how Agent ID is integrated)
- "Other required materials" — **exact list unknown** until the form appears. Prepare in advance (see checklist §3).
- Reward receiving address (rewards are sent to the address provided during submission — have this decided before submitting; presumably a USDC-receiving address on BNB Chain).

### Community Promotion Award — survey link (CONFIRMED, only link in the announcement)
- URL: **https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c**
- Fetched 19 Nov: the page renders only as "Scan to Download App iOS & Android" (Binance logo) — it is an app deep-link/QR page; the actual survey form opens **inside the Binance app**. Its contents/fields could not be read from the web. (Note: an older, separate Binance Agent OS mini-hackathon used the same `app.binance.com/uni-qr/user-survey/…` pattern — do not confuse the two campaigns; the survey ID above is the one linked from THIS announcement.)
- Mechanics (confirmed): post original X content about a participating project + hashtags **#BinanceWalletHackathon** + **#AgenticWallet** → submit the X link via that survey → 20 winners × 100 USDC, judged on post quality.

## 3. Materials checklist (prepare now, submit when the form appears)

| # | Item | Status |
|---|---|---|
| 1 | Project name (must NOT contain "Binance"/"BNB" — brand-impersonation red line) | Team to decide |
| 2 | Live website URL (product must be live for Innovation Award) | Frontend team |
| 3 | Contract address(es) on BSC mainnet, BscScan-verified + open-source | Contract team (see DEPLOY_OPTIONS.md) |
| 4 | Agent ID usage description (core-flow integration, not a bolt-on) | Team — write to the 30% "Application Depth" rubric |
| 5 | Reward receiving address (USDC on BNB Chain) | User decision |
| 6 | GitHub repo link (public, open-source code) | Likely required as "other materials" — prepare |
| 7 | Demo video / product walkthrough | Likely — prepare a short one |
| 8 | X post(s) with #BinanceWalletHackathon + #AgenticWallet (for the Community track + visibility) | Prepare; submit link via the survey above |
| 9 | Owner-permissions disclosure (mint/pause/tax/freeze/withdraw powers documented) | Required by red line #4 — put in README + submission |
| 10 | Risk warning on the page if the product involves trading | Required by red line #8 |
| 11 | ≥30 Agent ID holders interacting during the Submission Period (Innovation eligibility) | Distribution task — plan NOW, deadline 9 Dec 08:00 UTC |

## 4. Corrections / additions vs the task brief

The brief was broadly accurate; these are the corrections and things it missed:
1. **Award names:** the brief said "Project/Innovation/Community". The actual names are **Agent ID Ecosystem Pioneer Award** (metrics-based, 29,000 USDC) and **Agent Application Innovation Award** (judged, 29,000 USDC), plus the **Agent Ecosystem Promotion Award** (community, 2,000 USDC). "Project Awards" is the umbrella term for the two 29k awards (58,000 total).
2. **The 30-Agent-ID bar applies ONLY to the Innovation Award**, not to the Pioneer Award (which has no stated minimum) and not as a general participation requirement.
3. **"One award per project" is confirmed**, and additionally **each team may submit only one project**.
4. **Innovation scoring rubric was missing from the brief:** 100 points — Depth 30%, Practicality/Feasibility 25%, Completion 25%, Innovation 20%; tie-break on integration depth + completion; panel = Binance Wallet + BNB Chain + technical/ecosystem reps.
5. **Pioneer ranking is a weighted score** (interacting Agent ID addresses + tx volume + tx count), not a single metric; only submitted contract addresses count; interacting addresses must hold an Agent ID.
6. **Two-digit Agent ID perk:** all 20 project winners get one eligibility spot each (not just 1st place); higher rank = priority in selection.
7. **Community award is 20 winners × 100 USDC** (2,000 pool shared equally), judged on post quality — not a lottery, and not per-post payment.
8. **Reward distribution timing:** within 14 business days after the Public Review Period ends (after 20 Dec), to the reward address given at submission.
9. **Cheating reports:** audit@binance.com, from event start until end of Public Review Period; verified reporters get a reward.
10. **The brief assumed a submission route exists to be found — it does not (yet).** The announcement names no project-submission form/portal. This is the biggest open item (§2).
11. **Red lines are broader than the brief implied:** beyond the six bullets, there are also bans on promised returns ("passive income"), a risk-warning requirement for trading products, and a ban on packaging Agent ID as a "look up other people's wallets by name" tool.
12. **"Custodial Binance Agent Wallet" wording:** the Agentic Wallet is MPC keyless (no single private key exists; the AI/user never holds one), described by Binance as a "dedicated Keyless Wallet… separate from your existing Binance MPC Wallet". Functionally for this team the effect is the same (no deploy possible), but the accurate term is keyless/MPC, not custodial.
13. **Agent ID claim rule:** each user can claim only one Agent ID, non-transferable (brief had this right for davidganteng.ai / vefrikilla #19399).

## 5. Open items / what still needs verification (for the parent agent)

1. **Project submission form URL** — not found in any public source as of 19 Nov. Needs live-browser/app monitoring; re-check the announcement page (Binance sometimes edits in a link), @BinanceWallet on X, and the Binance app hackathon banner.
2. **Exact "other required materials"** for project submission — unknowable until the form appears (demo video? GitHub? X post? team info?).
3. **Community survey form fields** — the survey link only renders in-app; fields unknown from the web.
4. **Whether the MPC wallet (Option A deploy path) holds BNB** — user must check in-app.
5. **Remix + Binance Wallet WalletConnect contract-creation approval** — documented as supported in principle, not yet tested live with this wallet.

## Sources
- Announcement (full text fetched 19 Nov 2026): https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
- Binance Square repost (same facts, no extra links): https://www.binance.com/en/square/post/11-18-2026-binance-wallet-and-bnb-chain-to-host-agent-id-hackathon-with-60-000-usdc-in-rewards-389517706162185
- Community survey link (from announcement): https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c (fetched 19 Nov — renders as app-download page only)
- On-chain checks via https://bsc-dataseed.binance.org/ (Agent ID contract code + balanceOf = 1 for 0x8027…0D41), 19 Nov 2026.
