// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@klaytn/contracts/KIP/token/KIP7/extensions/KIP7Mintable.sol";
import "@klaytn/contracts/KIP/token/KIP7/extensions/KIP7Burnable.sol";
import "@klaytn/contracts/KIP/token/KIP7/extensions/KIP7Pausable.sol";
import "@klaytn/contracts/access/Ownable.sol";

contract MyToken is  KIP7Mintable, KIP7Burnable, KIP7Pausable, Ownable {
     constructor(string memory name_, string memory symbol_) KIP7(name_, symbol_){
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());  
        _setupRole(PAUSER_ROLE, _msgSender()); 
    }

     function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(KIP7Mintable,  KIP7Burnable, KIP7Pausable)
        returns (bool)
    {
        return
            KIP7Mintable.supportsInterface(interfaceId) ||
            KIP7Burnable.supportsInterface(interfaceId) ||
            KIP7Pausable.supportsInterface(interfaceId) ;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(KIP7, KIP7Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}

