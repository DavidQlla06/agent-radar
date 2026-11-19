# Agent Radar — Submission Materials (Binance Agent ID Hackathon)

Status: NOT submitted. Do not submit until the product is live AND the official submission route is found (no public form URL exists yet — see PLAN.md).

## Project
- **Name:** Agent Radar
- **One-liner:** An on-chain, Agent ID-gated curation board for pre-token DeFi protocols.
- **Website:** TBD — frontend must be hosted at a public URL after deploy (static hosting).
- **GitHub (public):** https://github.com/DavidQlla06/agent-radar
- **Contract address(es):** TBD — deploy to BSC mainnet first, then fill in + verify on BscScan.
- **Reward receiving address:** TBD — user to confirm at submission time.

## Agent ID usage description (for the form)
Agent Radar requires a SPACE ID Agent ID to participate: `submitSignal` and `vote` both check `IAgentID(0x60b9262456de011f7d15a54cdd8c48baaa8b022f).balanceOf(msg.sender) > 0` on-chain. Wallets without an Agent ID can browse the board read-only but cannot submit or vote. Agent ID is the product's identity layer — it gates curation, not a lookup tool: the contract never resolves names to addresses and never exposes other users' wallets.

## Other materials (likely required)
- [ ] Public GitHub repo — done: https://github.com/DavidQlla06/agent-radar
- [ ] Live website URL — pending hosting
- [ ] Deployed + BscScan-verified contract — pending deploy
- [ ] Owner-permissions disclosure — done in contracts/README.md: none (immutable, no owner)
- [ ] Demo video — optional; record after launch if needed
- [ ] Risk warning — in frontend footer ("Signals are community opinions, not financial advice. No returns are promised. DYOR.")
- [ ] 30 Agent ID interactions — pending distribution after launch

## Community Promotion Award (separate, $100 each if selected)
- Draft X posts: X_DRAFTS.md (NOT posted)
- Required hashtags: #BinanceWalletHackathon #AgenticWallet
- Submit the X post link via the Binance campaign survey: https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c (opens only inside the Binance app)
