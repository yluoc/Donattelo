// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../contracts/DonatelloNFT.sol";

contract DeployDonatelloNFT is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        DonatelloNFT nft = new DonatelloNFT();
        
        console.log("========================================");
        console.log(" DonatelloNFT deployed successfully!");
        console.log("========================================");
        console.log("Contract Address:", address(nft));
        console.log("Network: Base (Chain ID: 8453)");
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Copy the contract address above");
        console.log("2. Update NFTMinter.tsx with this address");
        console.log("3. Add contract to deployedContracts.ts");
        console.log("4. Test minting functionality");
        console.log("========================================");

        vm.stopBroadcast();
    }
}
