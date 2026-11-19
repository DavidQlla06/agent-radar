// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AgentRadar} from "../AgentRadar.sol";

/// @notice Minimal mock Agent ID: mintable in-test, exposes balanceOf.
///         Deployed at the REAL Agent ID address via vm.etch so the
///         hardcoded gate in AgentRadar is exercised end-to-end.
contract MockAgentID {
    mapping(address => uint256) private _balances;

    function mint(address to) external {
        _balances[to] += 1;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }
}

contract AgentRadarTest is Test {
    AgentRadar public radar;
    MockAgentID public mock;
    address public constant AGENT_ID_ADDR = 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F;

    event SignalSubmitted(
        uint256 indexed id,
        address indexed agent,
        string protocol,
        string slug,
        string thesis,
        uint256 timestamp
    );
    event Voted(uint256 indexed id, address indexed agent, bool up);

    address alice = makeAddr("alice"); // has Agent ID
    address bob = makeAddr("bob"); // has Agent ID
    address carol = makeAddr("carol"); // NO Agent ID

    function setUp() public {
        mock = new MockAgentID();
        // Place mock code at the real Agent ID address.
        vm.etch(AGENT_ID_ADDR, address(mock).code);
        mock = MockAgentID(AGENT_ID_ADDR);
        mock.mint(alice);
        mock.mint(bob);
        radar = new AgentRadar();
    }

    // --- submit ---

    function test_submitHappyPath() public {
        vm.prank(alice);
        uint256 id = radar.submitSignal("Relend Finance", "relend", "Pre-token lending, TVL ramping");
        assertEq(id, 0);
        assertEq(radar.signalCount(), 1);
        (
            address agent,
            string memory protocol,
            string memory slug,
            string memory thesis,
            uint256 up,
            uint256 down,
            uint256 createdAt
        ) = radar.signals(0);
        assertEq(agent, alice);
        assertEq(protocol, "Relend Finance");
        assertEq(slug, "relend");
        assertEq(thesis, "Pre-token lending, TVL ramping");
        assertEq(up, 0);
        assertEq(down, 0);
        assertEq(createdAt, block.timestamp);
        assertTrue(radar.agentSubmitted(keccak256(abi.encodePacked(alice, "relend"))));
    }

    function test_submitEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit SignalSubmitted(0, alice, "Relend Finance", "relend", "thesis", block.timestamp);
        vm.prank(alice);
        radar.submitSignal("Relend Finance", "relend", "thesis");
    }

    function test_submitWithoutAgentIdReverts() public {
        vm.prank(carol);
        vm.expectRevert("AgentRadar: Agent ID required");
        radar.submitSignal("Relend Finance", "relend", "thesis");
    }

    function test_submitDuplicateAgentSlugReverts() public {
        vm.prank(alice);
        radar.submitSignal("Relend Finance", "relend", "thesis");
        vm.prank(alice);
        vm.expectRevert("AgentRadar: already submitted");
        radar.submitSignal("Relend Finance", "relend", "different thesis");
        // Same slug, different agent is fine.
        vm.prank(bob);
        uint256 id = radar.submitSignal("Relend Finance", "relend", "thesis");
        assertEq(id, 1);
    }

    function test_submitLengthLimitsRevert() public {
        vm.startPrank(alice);
        vm.expectRevert("AgentRadar: bad protocol");
        radar.submitSignal("", "relend", "thesis");
        vm.expectRevert("AgentRadar: bad protocol");
        radar.submitSignal(_repeat("a", 81), "relend", "thesis");
        vm.expectRevert("AgentRadar: bad slug");
        radar.submitSignal("Relend", "", "thesis");
        vm.expectRevert("AgentRadar: bad slug");
        radar.submitSignal("Relend", _repeat("a", 81), "thesis");
        vm.expectRevert("AgentRadar: thesis too long");
        radar.submitSignal("Relend", "relend", _repeat("a", 281));
        vm.stopPrank();
        // Boundary values (80 / 80 / 280) succeed.
        vm.prank(alice);
        radar.submitSignal(_repeat("a", 80), _repeat("b", 80), _repeat("c", 280));
        assertEq(radar.signalCount(), 1);
    }

    // --- vote ---

    function _seedSignal() internal returns (uint256) {
        vm.prank(alice);
        return radar.submitSignal("Relend Finance", "relend", "thesis");
    }

    function test_voteUpDownAndFlip() public {
        uint256 id = _seedSignal();
        vm.prank(bob);
        radar.vote(id, true);
        (, , , , uint256 up, uint256 down, ) = radar.signals(id);
        assertEq(up, 1);
        assertEq(down, 0);
        assertEq(radar.votes(id, bob), 1);

        // Same vote again reverts.
        vm.prank(bob);
        vm.expectRevert("AgentRadar: already voted");
        radar.vote(id, true);

        // Flip to down.
        vm.prank(bob);
        radar.vote(id, false);
        (, , , , up, down, ) = radar.signals(id);
        assertEq(up, 0);
        assertEq(down, 1);
        assertEq(radar.votes(id, bob), -1);

        // Flip back to up.
        vm.prank(bob);
        radar.vote(id, true);
        (, , , , up, down, ) = radar.signals(id);
        assertEq(up, 1);
        assertEq(down, 0);
    }

    function test_voteEmitsEvent() public {
        uint256 id = _seedSignal();
        vm.expectEmit(true, true, false, true);
        emit Voted(id, bob, true);
        vm.prank(bob);
        radar.vote(id, true);
    }

    function test_voteWithoutAgentIdReverts() public {
        uint256 id = _seedSignal();
        vm.prank(carol);
        vm.expectRevert("AgentRadar: Agent ID required");
        radar.vote(id, true);
    }

    function test_voteNonexistentSignalReverts() public {
        vm.prank(alice);
        vm.expectRevert("AgentRadar: no such signal");
        radar.vote(99, true);
    }

    function _repeat(string memory s, uint256 n) internal pure returns (string memory) {
        bytes memory b = new bytes(n);
        bytes memory sb = bytes(s);
        for (uint256 i = 0; i < n; i++) b[i] = sb[0];
        return string(b);
    }
}
