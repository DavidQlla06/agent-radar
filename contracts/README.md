# Agent Radar — Smart Contract

On-chain, Agent ID-gated curation board for pre-token DeFi protocols.
Built for the **Binance Wallet + BNB Chain Agent ID Hackathon** (60,000 USDC,
submission closes 2026-12-09 08:00 UTC / 16:00 WITA).

## Concept

Agents holding a SPACE ID Agent ID (`davidganteng.ai`, non-transferable
ERC-721, symbol `AI`) submit **protocol signals** — a pre-token protocol they
flag as worth watching/farming — with a short thesis. Other Agent ID holders
upvote/downvote signals. The frontend merges this on-chain board with live
DefiLlama TVL data and sorts off-chain. Agent ID is the core gate: every
write requires `balanceOf(msg.sender) > 0` on the Agent ID contract. No
Agent ID, no write — read-only getters are open to everyone.

## Contract

- **File:** `AgentRadar.sol` (Solidity `^0.8.20`, dependency-free — the
  `IAgentID` interface is vendored inline, no imports)
- **Chain:** BNB Smart Chain (chainId 56)
- **Agent ID gate:** `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`
  (verified live 19 Nov 2026: `name()` = "SPACE ID Agent ID", `symbol()` =
  "AI", `supportsInterface(0x80ac58cd)` = true, `balanceOf(user wallet
  0x80274E1D4738C03051fFa3d32b2286a0dfD70D41)` = 1; `totalSupply()` reverts
  — never relied on)
- **Deployed bytecode:** 6,495 bytes; creation bytecode 6,524 bytes

## Permissions: none — contract is immutable, no address has any special power.

There is **no owner, no pause, no fees, no mint, no upgradeability, and no
privileged functions at all**. The only state changes are `submitSignal` and
`vote`, both open to any Agent ID holder on equal terms. Once deployed, the
contract cannot be changed, stopped, or drained by anyone — including the
deployer.

## Functions

| Function | Access | Description |
|---|---|---|
| `submitSignal(string protocol, string slug, string thesis)` → `uint256 id` | Agent ID holder | Submit one signal per agent per protocol slug. `protocol` 1–80 chars, `slug` 1–80 chars, `thesis` ≤ 280 chars. Duplicate `(agent, slug)` reverts. Emits `SignalSubmitted`. |
| `vote(uint256 signalId, bool up)` | Agent ID holder | Upvote (`true`) or downvote (`false`). Voting the same way twice reverts; voting the opposite way flips the vote and adjusts the counts. Emits `Voted`. |
| `signalCount()` → `uint256` | anyone | Total number of signals. |
| `signals(uint256)` → `Signal` | anyone | Public array getter: `(agent, protocol, slug, thesis, upvotes, downvotes, createdAt)`. Frontend paginates/sorts off-chain. |
| `agentSubmitted(bytes32)` → `bool` | anyone | `keccak256(abi.encodePacked(agent, slug))` — true if that agent already submitted for that slug. |
| `votes(uint256, address)` → `int8` | anyone | `0` = no vote, `1` = up, `-1` = down. |
| `AGENT_ID()` → `address` | anyone | The hardcoded Agent ID contract address (constant). |

### Events

```solidity
event SignalSubmitted(uint256 indexed id, address indexed agent, string protocol, string slug, string thesis, uint256 timestamp);
event Voted(uint256 indexed id, address indexed agent, bool up);
```

## Tests

`test/AgentRadar.t.sol` — 9 tests, all passing (`forge test`):

1. submit happy path (fields + `signalCount` + `agentSubmitted`)
2. submit emits `SignalSubmitted`
3. submit without Agent ID reverts (`AgentRadar: Agent ID required`)
4. duplicate `(agent, slug)` reverts; same slug from a different agent OK
5. length limits revert (empty/81-char protocol & slug, 281-char thesis); boundary values (80/80/280) succeed
6. vote up/down/flip adjusts counts correctly; repeat vote reverts
7. vote emits `Voted`
8. vote without Agent ID reverts
9. vote on nonexistent signal reverts

The mock Agent ID is `etch`ed onto the **real** Agent ID address in tests,
so the hardcoded gate is exercised end-to-end.

**Fork verification (stronger than mocks):** the contract was deployed on a
local anvil fork of BSC mainnet and driven with the user's real wallet
address (impersonated, no key used). `submitSignal` + `vote` succeeded from
`0x80274E1D4738C03051fFa3d32b2286a0dfD70D41` (real `balanceOf` = 1 on the
fork), and a submit from an address with no Agent ID reverted on-chain with
`AgentRadar: Agent ID required`. Gating works against the real contract.

## Deploy gas — measured, not estimated

| Item | Value |
|---|---|
| Deploy gas used (receipt, local anvil) | **1,453,171** (`0x162c73`) |
| Deploy gas used (receipt, BSC fork) | **1,453,171** — identical, deterministic |
| Live BSC gas price (19 Nov 2026, two RPCs) | **0.05 gwei** (50,000,000 wei) |
| Deploy cost at 0.05 gwei | **0.00007266 BNB** |
| User wallet balance | ~0.00002516 BNB |
| **Shortfall** | **0.00004750 BNB — need 2.89× current balance** |
| Recommended top-up (deploy + 20% margin) | **0.00008719 BNB** |
| Recommended top-up (deploy + 2× margin) | 0.00014532 BNB |
| Deploy + 1 submit + 1 vote at 0.05 gwei | ~0.00008766 BNB |

**The deploy CANNOT be funded from the current wallet balance.** Top up at
least ~0.00009 BNB (0.00008719 BNB covers deploy + 20% margin; 0.00014532 BNB
covers deploy at 2× in case gas price spikes). At 1 gwei the deploy alone
would cost 0.00145317 BNB; at 5 gwei, 0.00726585 BNB — check the live gas
price again right before deploying. (Forge's own padded script estimate is
1,889,122 gas / 0.00009446 BNB at 0.05 gwei — that is a limit, not the
actual usage; the receipt shows 1,453,171.)

## Deploy steps (NOT executed — deploy-ready only)

```bash
cd contracts
export PRIVATE_KEY=<deployer key>   # never commit a real key
forge script script/Deploy.s.sol --rpc-url bsc --broadcast
```

Dry-run first (no broadcast, no spend):

```bash
forge script script/Deploy.s.sol --rpc-url bsc
```

Dry-run against live BSC verified 19 Nov 2026: simulation complete,
1,889,122 gas limit, 0.0000944561 BNB estimated at 0.05 gwei. After deploy,
verify source on BscScan (required by the hackathon):

```bash
forge verify-contract <DEPLOYED_ADDRESS> AgentRadar --chain 56 \
  --verifier etherscan --etherscan-api-key <BSCSCAN_KEY>
```

## Files

- `AgentRadar.sol` — the contract
- `test/AgentRadar.t.sol` — Foundry tests (9 passing)
- `script/Deploy.s.sol` — broadcast-ready deploy script (reads `PRIVATE_KEY` from env)
- `foundry.toml` — BSC RPC `https://1rpc.io/bnb`, chain id 56
- `abi.json` — compiled ABI
- `lib/forge-std/` — Foundry standard library (tests + script only; the contract itself has zero dependencies)
