// SPDX-License-Identifier: MIT
// Klaytn Contract Library v1.0.0 (KIP/token/KIP17/presets/KIP17PresetMinterPauserAutoId.sol)
// Based on OpenZeppelin Contracts v4.5.0 (token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol)
// https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v4.5.0

pragma solidity ^0.8.0;

import "@klaytn/contracts/access/Ownable.sol"; 
import "@klaytn/contracts/access/AccessControlEnumerable.sol";   



interface IKIP17 {
  function balanceOf(address owner) external view returns (uint256 balance);
}


contract Whitelist is Ownable, AccessControlEnumerable {

    //saleId => nftAddresses[]
    mapping(uint256 => address[]) public nftAddressesBySaleId;

    //saleId => nftMinimumBalance[]
    mapping(uint256 => uint256[]) public nftMinimumBalanceBySaleId;

    //saleId => 지갑주소 => 화이트 리스트 여부        <<<< 경쟁
    mapping(uint256 => mapping(address => bool)) public saleWhitelist;

    //saleId => 지갑주소 => 화이트 리스트의 구매가능 개수 <<<<<<< 확정
    mapping(uint256 => mapping(address => uint256)) public saleQuotaWhitelist;

    //saleId => 할당량을 가지고 있는지 여부
    mapping(uint256 => bool) public hasQuota;

    //saleId => 1확정 count   2경쟁 count
    mapping(uint256 => uint256) public saleWhitelistCount;

    address public masterFarmAddr = 0x19b132eb9dcDAF1029C953dfeA7b71539BAb4405;     

    constructor(
        
        ) public {
             hasQuota[1] = true;   // 확정 화리
             hasQuota[2] = false;  // 경쟁 화리
            _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());   //관리자 선정
    }


    //////////////// smart contract GET_Holder_INFO 
    /*
    스마트컨트렉트 별  holder등록
    * saleId 별 특정 nft 홀더인지 확인할 nftInfo 추가
    * saleId : 판매 아이디
    * nftAddresses : saleId 별 특정 nft 홀더인지 확인할 nftAddress
    * nftMinimumBalance : saleId 별 특정 nft 홀더 개수 조건
    */
    function setNftInfo(uint256 saleId, address[] calldata nftAddresses, uint256[] calldata nftMinimumBalance) external onlyRole(DEFAULT_ADMIN_ROLE) {
      nftAddressesBySaleId[saleId] = nftAddresses;      //컨트랙트주소
      nftMinimumBalanceBySaleId[saleId] = nftMinimumBalance;  //보유수량
    }
    //등록 보기
    function getNftInfo(uint256 saleId,uint256 num) public view onlyRole(DEFAULT_ADMIN_ROLE) returns(address NFTcontractAddress, uint256 Balance) {
       return (NFTcontractAddress = nftAddressesBySaleId[saleId][num],Balance = nftMinimumBalanceBySaleId[saleId][num]);
    }


    //////////////////////WL Add userAddress  
    function addSaleWhitelist(uint256 _saleId, address[] calldata _addresses, uint256[] calldata _amounts) external onlyRole(DEFAULT_ADMIN_ROLE) {
      if (hasQuota[_saleId]) {
        _addSaleQuotaWhitelist(_saleId, _addresses, _amounts);  //확정 WL: id, userAddress, amount
      } else {
        _addSaleWhitelist(_saleId, _addresses);       //경쟁 WL: id, userAddress
      }
    }

    function _addSaleQuotaWhitelist(uint256 _saleId, address[] memory _addresses, uint256[] memory _amounts) internal {
      require(_addresses.length == _amounts.length, "two arrays must have same length");  //길이가 다르면 입력값 다른걸로 간주

      uint len = _addresses.length;
      for (uint i = 0; i < len; i++) {
        bool countSkip = false;  //등록여부
        
        if (saleQuotaWhitelist[_saleId][_addresses[i]] > 0) { 
          countSkip = true;   //등록되었네
        }

        saleQuotaWhitelist[_saleId][_addresses[i]] = _amounts[i];

        if (!countSkip) { //등록안되어잇으면 +1
          saleWhitelistCount[_saleId] += 1;
        }
      }
    }

    function _addSaleWhitelist(uint256 _saleId, address[] memory _addresses) internal {
      uint len = _addresses.length;
      for (uint i = 0; i < len; i++) {
        if (saleWhitelist[_saleId][_addresses[i]]) continue; 
        saleWhitelist[_saleId][_addresses[i]] = true;
        saleWhitelistCount[_saleId] += 1;
      }
    }

    /////////////////////WL remove
    function removeSaleWhitelist(uint256 _saleId, address[] calldata _addresses) external onlyRole(DEFAULT_ADMIN_ROLE) {
      if (hasQuota[_saleId]) {
        _removeSaleQuotaWhitelist(_saleId, _addresses); //확정
      } else {
        _removeSaleWhitelist(_saleId, _addresses);    //경쟁
      }
    }

    function _removeSaleQuotaWhitelist(uint256 _saleId, address[] memory _addresses) internal {
      uint len = _addresses.length;
      for (uint i = 0; i < len; i++) {
        if (saleQuotaWhitelist[_saleId][_addresses[i]] == 0) continue;

        saleQuotaWhitelist[_saleId][_addresses[i]] = 0;
        saleWhitelistCount[_saleId] -= 1;
      }
    }

    function _removeSaleWhitelist(uint256 _saleId, address[] memory _addresses) internal {
      uint len = _addresses.length;
      for (uint i = 0; i < len; i++) {
        if (!saleWhitelist[_saleId][_addresses[i]]) continue;
        saleWhitelist[_saleId][_addresses[i]] = false;
        saleWhitelistCount[_saleId] -= 1;
      }
    }

  ///////////////////////////////////WL user check
    function isSaleWhitelist(uint256 _saleId, address _address, uint256 _buyAmount, uint256 _amount) external view returns (bool) {
      if (hasQuota[_saleId]) {
        return _isSaleQuotaWhitelist(_saleId, _address, _buyAmount, _amount); //확정유저검사
      } else {  
        return _isSaleWhitelist(_saleId, _address);   //경쟁유저검사
      }
    }

    function _isSaleQuotaWhitelist(uint256 _saleId, address _address, uint256 _buyAmount, uint256 _amount) internal view returns (bool) {
      if (saleQuotaWhitelist[_saleId][_address] > 0 && saleQuotaWhitelist[_saleId][_address] >= _buyAmount + _amount) {
        return true;
      }

      /* 홀더검사 */
      // for (uint256 i = 0; i < nftAddressesBySaleId[_saleId].length; i++) {    //등록 컨트렉트에서 홀더 체크

      //   uint256 balance = IKIP17(nftAddressesBySaleId[_saleId][i]).balanceOf(_address);

      //   if(balance >= nftMinimumBalanceBySaleId[_saleId][i]) {
      //     return true;
      //   }
      // }
      return false;
    }

    function _isSaleWhitelist(uint256 _saleId, address _address) internal view returns (bool) {
      if (saleWhitelist[_saleId][_address]) {   //화이트리스트 체크 
        return true;
      }

      /* 홀더검사 */
      // for (uint256 i = 0; i < nftAddressesBySaleId[_saleId].length; i++) {    //등록 컨트렉트에서 홀더 체크

      //   uint256 balance = IKIP17(nftAddressesBySaleId[_saleId][i]).balanceOf(_address);

      //   if(balance >= nftMinimumBalanceBySaleId[_saleId][i]) {
      //     return true;
      //   }
      // }

      return false;
    }






}