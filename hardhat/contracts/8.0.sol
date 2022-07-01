// SPDX-License-Identifier: MIT
// Klaytn Contract Library v1.0.0 (KIP/token/KIP17/presets/KIP17PresetMinterPauserAutoId.sol)
// Based on OpenZeppelin Contracts v4.5.0 (token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol)
// https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v4.5.0

pragma solidity ^0.8.0;

import "@klaytn/contracts/utils/Context.sol";
import "@klaytn/contracts/access/AccessControlEnumerable.sol";
import "@klaytn/contracts/KIP/token/KIP17/extensions/KIP17Enumerable.sol";
import "@klaytn/contracts/KIP/token/KIP17/extensions/KIP17Mintable.sol";
import "@klaytn/contracts/KIP/token/KIP17/extensions/KIP17Burnable.sol";
import "@klaytn/contracts/KIP/token/KIP17/extensions/KIP17Pausable.sol";
import "@klaytn/contracts/utils/Counters.sol";

import "@klaytn/contracts/KIP/token/KIP17/extensions/KIP17URIStorage.sol";
import "@klaytn/contracts/KIP/token/KIP17/extensions/KIP17MetadataMintable.sol";

contract aaaaa is AccessControlEnumerable, KIP17MetadataMintable, KIP17Burnable,  KIP17Pausable, KIP17Enumerable{
    constructor(string memory name, string memory symbol) KIP17(name, symbol) {
        // _baseTokenURI = baseTokenURI;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        // _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }

     function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, KIP17Burnable,  KIP17Pausable, KIP17Enumerable,KIP17MetadataMintable)
        returns (bool)
    {
        return
            AccessControlEnumerable.supportsInterface(interfaceId) ||
            KIP17Burnable.supportsInterface(interfaceId) ||
            KIP17MetadataMintable.supportsInterface(interfaceId) ||
            KIP17Pausable.supportsInterface(interfaceId) ||
            KIP17Enumerable.supportsInterface(interfaceId);
    }

      function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(KIP17, KIP17Enumerable,KIP17Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    
    function _burn(uint256 tokenId) internal virtual override(KIP17, KIP17URIStorage) {
        super._burn(tokenId);
    }
     function tokenURI(uint256 tokenId) public view override(KIP17, KIP17URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

}

// contract uuu is KIP17Burnable, KIP17MetadataMintable{
//      constructor(string memory name, string memory symbol) KIP17(name, symbol) {
//         // _baseTokenURI = baseTokenURI;
//         _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
//         _setupRole(MINTER_ROLE, _msgSender());
//         // _setupRole(PAUSER_ROLE, _msgSender());
//     }

//  function supportsInterface(bytes4 interfaceId)
//         public
//         view
//         virtual
//         override( KIP17Burnable,KIP17MetadataMintable)
//         returns (bool)
//     {
//         return
//             // AccessControlEnumerable.supportsInterface(interfaceId) ||
//             KIP17Burnable.supportsInterface(interfaceId) ||
//             // KIP17Mintable.supportsInterface(interfaceId) ||
//             // KIP17Pausable.supportsInterface(interfaceId) ||
//             // KIP17Enumerable.supportsInterface(interfaceId);
//             KIP17MetadataMintable.supportsInterface(interfaceId);
//     }



//     //  function _beforeTokenTransfer(
//     //     address from,
//     //     address to,
//     //     uint256 tokenId
//     // ) internal virtual override(KIP17, KIP17Enumerable, KIP17Pausable) {
//     //     super._beforeTokenTransfer(from, to, tokenId);
//     // }

//      function _burn(uint256 tokenId) internal virtual override(KIP17, KIP17URIStorage) {
//         super._burn(tokenId);
//     }

//      function tokenURI(uint256 tokenId) internal virtual override(KIP17, KIP17URIStorage) {
//         super.tokenURI(tokenId);
//     }

// }