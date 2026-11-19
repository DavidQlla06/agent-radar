// Agent Radar — configuration.
// ALL chain addresses live here and only here. app.js reads them from
// this file; never hard-code an address in app.js or index.html.
//
// TODO (contract team): after the AgentRadar contract is deployed, replace
// CONTRACT_ADDRESS below with the real deployed address. Until then it is
// the zero address on purpose, and the board runs in "browse-only" mode
// (DefiLlama enrichment still works; submit/vote stay disabled).

const CONFIG = {
  // Zero address — the sentinel for "contract not deployed yet".
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",

  // AgentRadar contract on BSC (chainId 56). Placeholder until deployed.
  CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",

  // SPACE ID Agent ID (ERC-721, non-transferable) on BSC.
  AGENT_ID_ADDRESS: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f",

  CHAIN_ID: 56,
  CHAIN_NAME: "BSC",

  // DefiLlama public API (no key). Fetched once per page load.
  DEFILLAMA_PROTOCOLS_URL: "https://api.llama.fi/protocols",

  // AgentRadar contract ABI — matches the contract team's spec exactly.
  RADAR_ABI: [
    "function submitSignal(string protocol, string slug, string thesis) returns (uint256 id)",
    "function vote(uint256 signalId, bool up)",
    "function signalCount() view returns (uint256)",
    "function signals(uint256) view returns (address agent, string protocol, string slug, string thesis, uint256 upvotes, uint256 downvotes, uint256 createdAt)",
    "event SignalSubmitted(uint256 indexed id, address indexed agent, string protocol, string slug, string thesis, uint256 timestamp)",
    "event Voted(uint256 indexed id, address indexed agent, bool up)",
  ],

  // Agent ID ABI — balanceOf only; > 0 means the wallet holds an Agent ID.
  AGENT_ID_ABI: [
    "function balanceOf(address owner) view returns (uint256)",
  ],
};

// Expose for app.js (plain script tags, no modules, no build step).
window.CONFIG = CONFIG;
