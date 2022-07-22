// SPDX-License-Identifier: bellygom
pragma solidity ^0.8.0;

import "@klaytn/contracts/access/Ownable.sol"; 
import "@klaytn/contracts/access/AccessControlEnumerable.sol"; 
import "@klaytn/contracts/KIP/token/KIP17/extensions/IKIP17Enumerable.sol";

import "@klaytn/contracts/KIP/token/KIP7/IKIP7.sol";   

contract NFTstaking is AccessControlEnumerable, Ownable {
    IKIP17Enumerable private nftToken; // nft 토큰
    
    mapping(uint256 => uint256) public NFTidTokenList;

      constructor(
        address _KIP17Address               // nft 토큰 컨트랙트 주소
        ) public {
            nftToken = IKIP17Enumerable(_KIP17Address);       //연결 
            _setupRole(DEFAULT_ADMIN_ROLE, _msgSender()); 
    }

    function setTokenSprinkle (uint256 _amount) public onlyRole(DEFAULT_ADMIN_ROLE) returns(uint256){
        uint256 NFTNum = nftToken.totalSupply();
        require(NFTNum != 0, "nftToken totalSupply counte zero");
        require(_amount != 0, "nftToken totalSupply counte zero");
              
               for (uint256 i = 0; i < NFTNum; i++) {
                 NFTidTokenList[i] += _amount;
               }

        return NFTNum;
    }
    
}