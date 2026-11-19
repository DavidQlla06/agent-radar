// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AgentRadar} from "../AgentRadar.sol";

/// @notice Broadcast-ready deploy script for AgentRadar on BSC (chainId 56).
/// @dev Reads PRIVATE_KEY from the environment. DO NOT put any real key in
///      this repo. Dry-run first:
///        forge script script/Deploy.s.sol --rpc-url bsc
///      Then broadcast (only when the user explicitly approves spending gas):
///        forge script script/Deploy.s.sol --rpc-url bsc --broadcast
contract Deploy is Script {
    function run() external returns (AgentRadar radar) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        radar = new AgentRadar();
        vm.stopBroadcast();
        console.log("AgentRadar deployed at:", address(radar));
        console.log("Agent ID gate:", radar.AGENT_ID());
    }
}
