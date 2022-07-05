// SPDX-License-Identifier: MIT
// Klaytn Contract Library v1.0.0 (KIP/token/KIP17/extensions/KIP17MetadataMintable.sol)

pragma solidity ^0.8.0;


interface IKIP17Token {
    function mint(address to, uint256 tokenId) external;
    function mintWithTokenURI(address to, uint256 tokenId, string calldata tokenURI) external;
    function balanceOf(address addr) external view returns (uint);
}