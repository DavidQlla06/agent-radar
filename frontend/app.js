// Agent Radar — frontend logic (no build step, no backend, no keys).
// All chain addresses come from config.js (window.CONFIG). This file
// never hard-codes a contract address.
//
// Flow: connect injected wallet (Binance Wallet / MetaMask) on BSC
// (chainId 56) -> check Agent ID via balanceOf -> read signals on-chain
// -> enrich each signal once with live DefiLlama data (matched by slug)
// -> rank by net votes. Submit/vote need an Agent ID and write a tx.

(function () {
  "use strict";

  var cfg = window.CONFIG;
  var ZERO_ADDRESS = cfg.ZERO_ADDRESS;

  // ---- state -------------------------------------------------------------
  var provider = null;      // ethers.BrowserProvider
  var signer = null;
  var account = null;       // checksummed address string
  var hasAgentId = false;
  var agentIdChecked = false;
  var radarRead = null;     // read-only AgentRadar contract (provider)
  var agentIdRead = null;   // read-only Agent ID contract (provider)
  var llamaBySlug = null;   // Map slug -> DefiLlama protocol, once loaded
  var llamaPromise = null;
  var signalsCache = [];    // last loaded signals, raw

  // ---- DOM helpers -------------------------------------------------------
  function $(id) { return document.getElementById(id); }
  function el(id) { return $(id); }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function shortAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  function fmtUsd(n) {
    if (n == null || !Number.isFinite(n)) return "—";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + Math.round(n);
  }

  function fmtDate(ts) {
    var ms = Number(ts) * 1000;
    if (!ms) return "—";
    return new Date(ms).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function setStatus(id, msg) { var n = el(id); if (n) n.textContent = msg; }

  // ---- DefiLlama enrichment ----------------------------------------------
  // Token-status rule reused from the Token Radar model (model.mjs):
  // a protocol is pre-token when DefiLlama reports no market cap, no
  // CoinGecko id, AND no token contract address. The `address` test is
  // what makes it work on live data (the live API fills `symbol` for
  // every protocol, so a symbol test would rank nothing). A protocol that
  // HAS a token is shown apart and never ranked as pre-token.
  function isPreToken(p) {
    return p.mcap == null && p.gecko_id == null && (p.address == null || p.address === undefined);
  }

  function loadLlama() {
    if (llamaPromise) return llamaPromise;
    llamaPromise = fetch(cfg.DEFILLAMA_PROTOCOLS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("DefiLlama responded " + res.status);
        return res.json();
      })
      .then(function (data) {
        // The API returns a bare array of protocols (not {protocols: [...]}).
        var list = Array.isArray(data) ? data : (data.protocols || []);
        var map = new Map();
        list.forEach(function (p) { if (p.slug) map.set(p.slug, p); });
        llamaBySlug = map;
        setStatus("llama-status", "DefiLlama: " + map.size + " protocols loaded. TVL shown live; tokens flagged, never ranked as pre-token.");
        return map;
      })
      .catch(function (err) {
        llamaBySlug = new Map();
        setStatus("llama-status", "DefiLlama enrichment unavailable right now (" + err.message + "). Votes still work.");
        return llamaBySlug;
      });
    return llamaPromise;
  }

  // ---- wallet / chain ----------------------------------------------------
  function contractDeployed() {
    return cfg.CONTRACT_ADDRESS && cfg.CONTRACT_ADDRESS.toLowerCase() !== ZERO_ADDRESS;
  }

  function updateBadge() {
    var badge = el("agent-badge");
    if (!agentIdChecked) { badge.hidden = true; return; }
    badge.hidden = false;
    if (hasAgentId) {
      badge.className = "badge badge-yes";
      badge.textContent = "✓ You hold an Agent ID";
    } else {
      badge.className = "badge badge-no";
      badge.textContent = "No Agent ID — browse only";
    }
  }

  function updateGating() {
    var canAct = !!account && hasAgentId && contractDeployed();
    el("submit-btn").disabled = !canAct;
    var note = "";
    if (!account) note = "Connect a wallet to check your Agent ID.";
    else if (!hasAgentId) note = "No Agent ID — you can browse but not submit/vote.";
    else if (!contractDeployed()) note = "AgentRadar contract not deployed yet — submit/vote unlock after deploy.";
    setStatus("submit-status", note);
    document.querySelectorAll("#board .vote").forEach(function (b) { b.disabled = !canAct; });
  }

  async function ensureChain() {
    var chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(chainIdHex, 16) === cfg.CHAIN_ID) return true;
    var note = el("network-note");
    note.hidden = false;
    note.textContent = "Wrong network — asking your wallet to switch to " + cfg.CHAIN_NAME + " (chain " + cfg.CHAIN_ID + ")…";
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + cfg.CHAIN_ID.toString(16) }],
      });
    } catch (err) {
      if (err && err.code === 4902) {
        // Chain not added to the wallet yet — add BSC, then switch.
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x" + cfg.CHAIN_ID.toString(16),
            chainName: "BNB Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com/"],
          }],
        });
      } else {
        throw err;
      }
    }
    note.textContent = "";
    note.hidden = true;
    return true;
  }

  async function checkAgentId() {
    agentIdChecked = false;
    hasAgentId = false;
    updateBadge();
    if (!provider || !account) return;
    try {
      agentIdRead = new ethers.Contract(cfg.AGENT_ID_ADDRESS, cfg.AGENT_ID_ABI, provider);
      var bal = await agentIdRead.balanceOf(account);
      hasAgentId = bal > 0n;
    } catch (err) {
      console.error("Agent ID check failed:", err);
      setStatus("board-status", "Could not check Agent ID (" + (err.message || err) + "). You can still browse once connected.");
    }
    agentIdChecked = true;
    updateBadge();
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("board-status", "No wallet found. Install Binance Wallet or MetaMask, then refresh this page.");
      return;
    }
    if (typeof ethers === "undefined") {
      setStatus("board-status", "ethers library failed to load from the CDN. Check your connection and refresh.");
      return;
    }
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      await ensureChain();
      var accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) return;
      signer = await provider.getSigner();
      account = await signer.getAddress();
      el("wallet-status").textContent = "Connected: " + shortAddress(account);
      el("connect-btn").textContent = "Connected";
      el("connect-btn").disabled = true;
      await checkAgentId();
      await loadBoard();
      updateGating();
    } catch (err) {
      console.error("Connect failed:", err);
      setStatus("board-status", "Could not connect (" + (err.message || err) + ").");
    }
  }

  // ---- board -------------------------------------------------------------
  // Reads every signal via signalCount() + signals(i). SignalSubmitted
  // events are queried as a cross-check so a signal the getter misses
  // still shows up; the getter's row always wins on a clash.
  async function loadBoard() {
    var board = el("board");
    board.innerHTML = "";
    if (!contractDeployed()) {
      setStatus("board-status", "AgentRadar contract not deployed yet (address in config.js is still the placeholder). The board will load automatically once the deployed address is set — DefiLlama enrichment below already works.");
      loadLlama();
      updateGating();
      return;
    }
    setStatus("board-status", "Loading signals from the chain…");
    try {
      radarRead = new ethers.Contract(cfg.CONTRACT_ADDRESS, cfg.RADAR_ABI, provider);
      var count = await radarRead.signalCount();
      var byId = new Map();
      for (var i = 0; i < Number(count); i++) {
        var s = await radarRead.signals(i);
        byId.set(i, {
          id: i, agent: s.agent, protocol: s.protocol, slug: s.slug,
          thesis: s.thesis, upvotes: Number(s.upvotes), downvotes: Number(s.downvotes),
          createdAt: Number(s.createdAt),
        });
      }
      try {
        var events = await radarRead.queryFilter(radarRead.filters.SignalSubmitted(), 0, "latest");
        events.forEach(function (ev) {
          var id = Number(ev.args.id);
          if (!byId.has(id)) {
            byId.set(id, {
              id: id, agent: ev.args.agent, protocol: ev.args.protocol, slug: ev.args.slug,
              thesis: ev.args.thesis, upvotes: 0, downvotes: 0,
              createdAt: Number(ev.args.timestamp),
            });
          }
        });
      } catch (evErr) {
        // Events are a cross-check only; the getter data above stands.
        console.warn("SignalSubmitted event scan skipped:", evErr);
      }
      signalsCache = Array.from(byId.values());
      await loadLlama();
      renderBoard();
      setStatus("board-status", signalsCache.length === 0
        ? "No signals yet — be the first Agent ID holder to submit one."
        : signalsCache.length + " signal(s), ranked by net votes.");
    } catch (err) {
      console.error("Board load failed:", err);
      setStatus("board-status", "Could not load signals (" + (err.message || err) + ").");
    }
    updateGating();
  }

  function renderBoard() {
    var board = el("board");
    board.innerHTML = "";
    var rows = signalsCache.slice().sort(function (a, b) {
      var netA = a.upvotes - a.downvotes, netB = b.upvotes - b.downvotes;
      return (netB - netA) || (b.createdAt - a.createdAt);
    });
    rows.forEach(function (s) {
      var net = s.upvotes - s.downvotes;
      var li = document.createElement("li");
      var p = llamaBySlug ? llamaBySlug.get(s.slug) : null;
      var enrich;
      if (!llamaBySlug) {
        enrich = '<span class="tag tag-unknown">TVL loading…</span>';
      } else if (!p) {
        enrich = '<span class="tag tag-unknown">Not on DefiLlama</span>';
      } else if (isPreToken(p)) {
        enrich = '<span class="tag tag-pretoken">Pre-token</span><span>TVL ' + escapeHtml(fmtUsd(p.tvl)) + '</span>';
      } else {
        enrich = '<span class="tag tag-hastoken">Has token — not pre-token</span><span>TVL ' + escapeHtml(fmtUsd(p.tvl)) + '</span>';
      }
      li.innerHTML =
        '<div class="row-head"><div><span class="protocol">' + escapeHtml(s.protocol) + '</span> ' +
        '<span class="slug">' + escapeHtml(s.slug) + '</span></div>' +
        '<span class="net">Net ' + (net >= 0 ? "+" : "") + net + '</span></div>' +
        '<p class="thesis">' + escapeHtml(s.thesis) + '</p>' +
        '<div class="meta"><span>By ' + escapeHtml(shortAddress(s.agent)) + '</span>' +
        '<span>' + escapeHtml(fmtDate(s.createdAt)) + '</span>' + enrich + '</div>' +
        '<div class="votes">' +
        '<button type="button" class="vote" data-id="' + s.id + '" data-up="1">▲ Upvote (' + s.upvotes + ')</button>' +
        '<button type="button" class="vote down" data-id="' + s.id + '" data-up="0">▼ Downvote (' + s.downvotes + ')</button>' +
        '</div>';
      board.appendChild(li);
    });
    updateGating();
  }

  // ---- voting / submitting (write txs — Agent ID holders only) -----------
  async function vote(signalId, up) {
    if (!signer || !hasAgentId || !contractDeployed()) return;
    setStatus("board-status", "Sending your vote… confirm it in your wallet.");
    try {
      var radar = new ethers.Contract(cfg.CONTRACT_ADDRESS, cfg.RADAR_ABI, signer);
      var tx = await radar.vote(signalId, up);
      setStatus("board-status", "Vote sent (" + tx.hash.slice(0, 10) + "…). Waiting for confirmation…");
      await tx.wait();
      await loadBoard();
    } catch (err) {
      console.error("Vote failed:", err);
      setStatus("board-status", "Vote failed (" + (err.message || err) + ").");
    }
  }

  async function submitSignal(ev) {
    ev.preventDefault();
    if (!signer || !hasAgentId || !contractDeployed()) return;
    var protocol = el("protocol-input").value.trim();
    var slug = el("slug-input").value.trim();
    var thesis = el("thesis-input").value.trim();
    if (!protocol || !slug || !thesis) { setStatus("submit-status", "Fill in protocol, slug and thesis."); return; }
    if (thesis.length > 280) { setStatus("submit-status", "Thesis is over 280 characters."); return; }
    setStatus("submit-status", "Sending your signal… confirm it in your wallet. This costs a small network fee (gas) only.");
    try {
      var radar = new ethers.Contract(cfg.CONTRACT_ADDRESS, cfg.RADAR_ABI, signer);
      var tx = await radar.submitSignal(protocol, slug, thesis);
      setStatus("submit-status", "Signal sent (" + tx.hash.slice(0, 10) + "…). Waiting for confirmation…");
      await tx.wait();
      el("submit-form").reset();
      el("thesis-count").textContent = "0";
      await loadBoard();
      setStatus("submit-status", "Signal submitted on-chain.");
    } catch (err) {
      console.error("Submit failed:", err);
      setStatus("submit-status", "Submit failed (" + (err.message || err) + ").");
    }
  }

  // ---- wiring ------------------------------------------------------------
  function init() {
    if (typeof ethers === "undefined") {
      setStatus("board-status", "ethers library failed to load from the CDN. Check your connection and refresh.");
    }
    el("connect-btn").addEventListener("click", connectWallet);
    el("refresh-btn").addEventListener("click", loadBoard);
    el("submit-form").addEventListener("submit", submitSignal);
    el("thesis-input").addEventListener("input", function (e) {
      el("thesis-count").textContent = String(e.target.value.length);
    });
    el("board").addEventListener("click", function (e) {
      var btn = e.target.closest("button.vote");
      if (!btn || btn.disabled) return;
      vote(Number(btn.getAttribute("data-id")), btn.getAttribute("data-up") === "1");
    });
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", function () { window.location.reload(); });
      window.ethereum.on("chainChanged", function () { window.location.reload(); });
    }
    // Enrichment loads even before a wallet connects, so the page is
    // useful in browse mode; the on-chain board loads after connect.
    loadLlama();
    updateGating();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
