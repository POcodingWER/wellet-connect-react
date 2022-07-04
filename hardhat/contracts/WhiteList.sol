// SPDX-License-Identifier: MIT
// Klaytn Contract Library v1.0.0 (KIP/token/KIP17/presets/KIP17PresetMinterPauserAutoId.sol)
// Based on OpenZeppelin Contracts v4.5.0 (token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol)
// https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v4.5.0

pragma solidity ^0.8.0;

import "@klaytn/contracts/access/Ownable.sol"; 
import "@klaytn/contracts/access/AccessControlEnumerable.sol";   

interface IWhitelist {
  function addSaleWhitelist(uint256 _saleId, address[] calldata _addresses, uint256[] calldata _amounts) external;
  function removeSaleWhitelist(uint256 _saleId, address[] calldata _addresses) external;
  function isSaleWhitelist(uint256 _saleId, address _address, uint256 _buyAmount, uint256 _amount) external view returns (bool);
}

contract Whitelist is Ownable, AccessControlEnumerable {

    //saleId => nftAddresses[]
    mapping(uint256 => address[]) public nftAddressesBySaleId;

    //saleId => nftMinimumBalance[]
    mapping(uint256 => uint256[]) public nftMinimumBalanceBySaleId;

    //saleId => 지갑주소 => 화이트 리스트 여부
    mapping(uint256 => mapping(address => bool)) public saleWhitelist;

    //saleId => 지갑주소 => 화이트 리스트의 구매가능 개수
    mapping(uint256 => mapping(address => uint256)) public saleQuotaWhitelist;

    //saleId => 할당량을 가지고 있는지 여부
    mapping(uint256 => bool) public hasQuota;

    //saleId => 화이트리스트 수
    mapping(uint256 => uint256) public saleWhitelistCount;

    address public masterFarmAddr = 0x19b132eb9dcDAF1029C953dfeA7b71539BAb4405;     

    // constructor(
        
    //     ) public {
    //         _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());   //관리자 선정
    // }


    //////////////// 세팅
    /*
    * saleId 별 특정 nft 홀더인지 확인할 nftInfo 추가
    * saleId : 판매 아이디
    * nftAddresses : saleId 별 특정 nft 홀더인지 확인할 nftAddress
    * nftMinimumBalance : saleId 별 특정 nft 홀더 개수 조건
    */
    function setNftInfo(uint256 saleId, address[] calldata nftAddresses, uint256[] calldata nftMinimumBalance) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        nftAddressesBySaleId[saleId] = nftAddresses;
        nftMinimumBalanceBySaleId[saleId] = nftMinimumBalance;
    }


}