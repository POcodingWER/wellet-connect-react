// SPDX-License-Identifier: bellygom
pragma solidity ^0.8.0;

import "@klaytn/contracts/access/Ownable.sol"; 
import "@klaytn/contracts/KIP/token/KIP17/extensions/IKIP17Enumerable.sol";

contract NFTstaking is Ownable {
    IKIP17Enumerable private nftToken; // nft 토큰
    uint256 public a = 5;
      constructor(
        address _KIP17Address               // nft 토큰 컨트랙트 주소
        ) public {
            nftToken = IKIP17Enumerable(_KIP17Address);       //연결 
    }

     function getTotalSupply() public view returns(uint256){
        uint256 memory NFTNum = nftToken.totalSupply();
         require(NFTNum != 0, "nftToken totalSupply counte zero");
               for (uint256 i = 0; i < amount; i++) {}

        return nftToken.totalSupply();
    }
    
}