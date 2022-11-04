// SPDX-License-Identifier: MIT
// Klaytn Contract Library v1.0.0 (KIP/token/KIP17/presets/KIP17PresetMinterPauserAutoId.sol)
// Based on OpenZeppelin Contracts v4.5.0 (token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol)
// https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v4.5.0

pragma solidity ^0.8.0;

// import "@klaytn/contracts/KIP/token/KIP17/extensions/KIP17Mintable.sol";     //KIP17MetadataMintable로 대체

import "@klaytn/contracts/contracts/access/AccessControlEnumerable.sol";                  //minterRole
import "@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17Enumerable.sol";      //발행 갯수 nft 카운터 느낌
import "@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17Burnable.sol";        //태움  
import "@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17Pausable.sol";        //멈춤  

import "@klaytn/contracts/contracts/KIP/token/KIP17/extensions/KIP17MetadataMintable.sol";    //URi 추가 mintable
import "@klaytn/contracts/contracts/access/Ownable.sol";    //컨트랙트 소유권
import "@klaytn/contracts/contracts/utils/Base64.sol";      //json 형태로 바꿔주기위한모듈

contract OwnableKIP17 is AccessControlEnumerable, KIP17MetadataMintable, KIP17Burnable,  KIP17Pausable, KIP17Enumerable, Ownable{
    constructor(string memory name, string memory symbol) KIP17(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());       //관리자 role
        _setupRole(MINTER_ROLE, _msgSender());              //AccessControlEnumerable minterRole
        _setupRole(PAUSER_ROLE, _msgSender());              //정지 시작 role
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

      function contractURI() public pure returns (string memory) {    //오픈씨에서 가져가서 슬때 처음에 컬랙션 세팅해주는 함수
        string memory name = "test";
        //로열티 퍼센트
        string memory seller_fee_basis_points = "750";
        //로열티 지갑
        string memory fee_recipient = "0xbb2205461e27D5CD017D6ed74e23904817f943a0";
        //edit들어가면 띄어쓰기되어있는데 opensea에서는 안되어있네 ㅜㅜ
        string memory description = "";

        string memory json = Base64.encode(
        bytes(
            string(
            abi.encodePacked(
                '{"name": "',
                name,
                '", "seller_fee_basis_points": "',
                seller_fee_basis_points,
                '", "description": "',
                description,
                '", "fee_recipient": "',
                fee_recipient,
                '"}'
            )
            )
        )
        );
        return string(abi.encodePacked('data:application/json;base64,', json));
    }


}
