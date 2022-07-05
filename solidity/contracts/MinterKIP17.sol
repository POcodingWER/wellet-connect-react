// SPDX-License-Identifier: MIT
// Klaytn Contract Library v1.0.0 (KIP/token/KIP17/presets/KIP17PresetMinterPauserAutoId.sol)
// Based on OpenZeppelin Contracts v4.5.0 (token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol)
// https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v4.5.0

pragma solidity ^0.8.0;

import "./klaytn/utils/Counters.sol";  //NFT카운터 

import "./klaytn/access/Ownable.sol"; 
import "./klaytn/access/AccessControlEnumerable.sol";   
import "./IKIP17Token.sol";
// import "@klaytn/contracts/KIP/token/KIP7/IKIP7.sol";   

interface Whitelist {
  function addSaleWhitelist(uint256 _saleId, address[] calldata _addresses, uint256[] calldata _amounts) external;
  function removeSaleWhitelist(uint256 _saleId, address[] calldata _addresses) external;
  function isSaleWhitelist(uint256 _saleId, address _address, uint256 _buyAmount, uint256 _amount) external view returns (bool);
}

contract MinterKIP17 is Ownable, AccessControlEnumerable{
   
    enum SaleType {
        Whitelist,
        Public
    }

    // nft Ids
    using Counters for Counters.Counter;
    Counters.Counter public tokenIdCounter;

    // Counters.Counter public tokenIdCounter;
    bool public isOpen; // 판매 중 (true이면 판매중)
    uint256 public currentSaleId; // 현재 판매중인 id (0 이면 stop)
    SaleType public currentSaleType; // 현재 판매중인 saleType(whitelist | public)

    uint256 private lastSaleId; // 등록된 saleId
    uint256 private retryBlockAmount = 5; // 재 진입 가능한 block 수 (6 이면 6초 뒤에 다시 구매 가능)
    string private baseTokenURI; // NFT 토큰 URI

    address payable private walletAddress; // 판매금액 판을 지갑 주소
    IKIP17Token private nftToken; // nft 토큰
    // IKIP7 private kip7Token; //kip7 토큰 (kip7로 구매시)
    Whitelist private whiteListContract;    // 화이트리스트 Contract

    struct SaleInfo {
    uint256 startBlockNumber;   // 판매 시작하는 #block
    uint256 lastSaleTokenId;    // 순서대로 판매시 마지막 토큰Id (99로 설정시 0부터 99까지 100개 판매가능)
    uint256 buyAmountPerWallet; // 지갑 당 구매가능 한 수 (10000로 설정시 제한없음)
    uint256 buyAmountPerTrx;    // 트랜잭션 당 구매가능 한 수 (10000로 설정시 제한없음)
    uint256 saleKlayAmount;     // klay 판매 가격
    uint256 saleKIP7Amount;     // KIP7 판매 가격
    }

    mapping(address => uint256) private joinedWalletList;   // 접속 내역 (지갑주소 => 진입한 block 번호)
    mapping(uint256 => SaleInfo) private saleInfoById;      // 판매정보
    mapping(uint256 => mapping(address => uint256)) private buyAmountByWallet; // 구매내역 saleId => (지갑주소 => 구매한수량)


    constructor(
        address payable _walletAddress,         // 판매 금액 받을 지갑 주소
        address _KIP17Address,               // nft 토큰 컨트랙트 주소
        address _whiteListContractAddress,   // 화이트 리스트 컨트랙트 주소
        // address _kip7Token,                  // kip7 토큰 컨트랙트 주소
        string memory _baseTokenURI             //NFT 메타데이터 Uri
        ) public {
            walletAddress = _walletAddress;     //코인보낼 지갑주소
            nftToken = IKIP17Token(_KIP17Address);       //연결 
            whiteListContract = Whitelist(_whiteListContractAddress);       //화리연결
            // kip7Token = IKIP7(_kip7Token);
            baseTokenURI = _baseTokenURI;           //MetaData 주소 
            _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());   //관리자 선정
    }

////////////////////기본 유효성검사
    modifier checkSaleInfo(uint256 saleId, uint256 amount) {
        require(true == isOpen, "not open sale");           // 판매가 열였는지
        require(saleId != 0, "Not for sale");               // saleid가 0아닌지
        require(saleId == currentSaleId, "Not match saleId");   //프론트에서 보낸 saleId랑 현재 판매id랑 같은지
        require(            //현재블록 > 민팅해서 받은블록정보+5초  
        block.number > joinedWalletList[msg.sender]+(retryBlockAmount),
        "please try again in a few 5 sec"
        );
        joinedWalletList[msg.sender] = block.number;      //블록최신화

        // 세일정보최신화 없을 경우 확인 (모든 값이 0으로 들어감)
        SaleInfo memory saleInfo = saleInfoById[saleId];    
        // 판매 시간이 지낫는지 (#block)
        require(block.number >= saleInfo.startBlockNumber, "not sales time");
        // 구매 할 수량 확인
        require(amount > 0 && amount <= saleInfo.buyAmountPerTrx, "invalid amount");
        // 모두 판매 되었는지
        require( tokenIdCounter.current() + amount - 1 <= saleInfo.lastSaleTokenId, "sold out");
        // 지갑당 구매 수량 확인
        require(buyAmountByWallet[saleId][msg.sender] + amount <= saleInfo.buyAmountPerWallet, "already bought");

        _;

        // 구매 수량 저장 (storage)
        buyAmountByWallet[saleId][msg.sender] += amount;
    }

///////////////////////////////세일정보
    //화리
    function whitelistSale(uint256 saleId, uint256 amount) public payable checkSaleInfo(saleId, amount){
        require(currentSaleType == SaleType.Whitelist, "Not match saleType");

        SaleInfo memory saleInfo = saleInfoById[saleId];
    
        //WL:  isSaleWhitelist(판매유형,주소,구매수량,구매 할 수량)
        require(whiteListContract.isSaleWhitelist(saleId, msg.sender, buyAmountByWallet[saleId][msg.sender], amount), "not white list");

        require(msg.value != 0, "invalid klay value");
        require(msg.value == saleInfo.saleKlayAmount*amount, "not enough Klay");

        // 판매금액 전송
        walletAddress.transfer(msg.value);

        for (uint256 i = 0; i < amount; i++) {
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();

        //nft 토큰 전송
        nftToken.mintWithTokenURI(
            msg.sender,
            tokenId,
            string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId), ".json"))
        );
        }
    }

    //퍼블
    function publicSale(uint256 saleId, uint256 amount) public payable checkSaleInfo(saleId, amount) {
        require(currentSaleType == SaleType.Public, "Not match saleType");  //세일타입  

        SaleInfo memory saleInfo = saleInfoById[saleId];
        require(msg.value != 0, "invalid klay value");      
        require(msg.value == saleInfo.saleKlayAmount*amount, "not enough Klay");       //받은 클레이랑 설정 클레이랑 같은지 비교

        // 판매금액 전송
        walletAddress.transfer(msg.value);      //transfer사용해서 klaytn 보냄

        for (uint256 i = 0; i < amount; i++) {  
        uint256 tokenId = tokenIdCounter.current();     //현재 토큰 id num
        tokenIdCounter.increment();             //토큰카운트 업

        //KIP17 토큰 전송
        nftToken.mintWithTokenURI(
            msg.sender,
            tokenId,
            string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId), ".json"))
          );
        }
    }







    
//////////////////////////////////////////////설정
    function open(uint256 saleId, SaleType saleType) public onlyRole(DEFAULT_ADMIN_ROLE) {        //경매시작
        isOpen = true;              //문이 열려있는지 닫혀잇는지
        currentSaleId = saleId;     //몇번째 세일아이디?
        currentSaleType = saleType; //whiteList(0) or public(1)
    }  

    function close() public onlyRole(DEFAULT_ADMIN_ROLE) {       
        isOpen = false;             //문닫으셈
    }

    function setSaleInfo(
        uint256 saleId,             
        uint256 startBlockNumber,   // 민팅 시작블럭
        uint256 lastSaleTokenId,    // 순서대로 판매시 마지막 토큰Id (99로 설정시 0부터 99까지 100개 판매가능)
        uint256 buyAmountPerWallet,
        uint256 buyAmountPerTrx,
        uint256 saleKlayAmount
        // uint256 saleKIP7Amount
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        saleInfoById[saleId].startBlockNumber = startBlockNumber;
        saleInfoById[saleId].lastSaleTokenId = lastSaleTokenId;
        saleInfoById[saleId].buyAmountPerWallet = buyAmountPerWallet;
        saleInfoById[saleId].buyAmountPerTrx = buyAmountPerTrx;
        saleInfoById[saleId].saleKlayAmount = saleKlayAmount;
        // saleInfoById[saleId].saleKIP7Amount = saleKIP7Amount;

        if (saleId > lastSaleId) {
        lastSaleId = saleId;            //세일아이디 체인지
        }
    }

    function getSaleInfo(uint256 saleId)
        public
        view
        returns (
        uint256 startBlockNumber,
        uint256 lastSaleTokenId,
        uint256 buyAmountPerWallet,
        uint256 buyAmountPerTrx,
        uint256 saleKlayAmount,
        uint256 saleKIP7Amount
        )
    {
        startBlockNumber = saleInfoById[saleId].startBlockNumber;
        lastSaleTokenId = saleInfoById[saleId].lastSaleTokenId;
        buyAmountPerWallet = saleInfoById[saleId].buyAmountPerWallet;
        buyAmountPerTrx = saleInfoById[saleId].buyAmountPerTrx;
        saleKlayAmount = saleInfoById[saleId].saleKlayAmount;
        saleKIP7Amount = saleInfoById[saleId].saleKIP7Amount;
    }

    //constructor에서 설정해서 안쓸꺼같지만 나중대비
    function setOptions(uint256 _retryBlockAmount, string memory _baseTokenURI) public onlyRole(DEFAULT_ADMIN_ROLE) {       
        retryBlockAmount = _retryBlockAmount;
        baseTokenURI = _baseTokenURI;
     }

    function getOptions()   
        public
        view
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (
        bool _isOpen,
        uint256 _currentSaleId,
        SaleType _currentSaleType,
        uint256 _lastSaleId,
        uint256 _retryBlockAmount,
        string memory _baseTokenURI
        )
    {
        return (isOpen, currentSaleId, currentSaleType, lastSaleId, retryBlockAmount, baseTokenURI);
    }

    
    function setAddress(     //constructor에서 설정해서 만약을위해서 
        address _nftToken,
        address _whiteListContract,
        // address _kip7Token,
        address payable _walletAddress
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        nftToken = IKIP17Token(_nftToken);
        // kip7Token = IKIP7(_kip7Token);
        whiteListContract = Whitelist(_whiteListContract);
        walletAddress = _walletAddress;
    }

    function getAddress()
        public
        view
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (
        // IKIP7 _kip7Token,
        IKIP17Token _nftToken,
        Whitelist _whiteListContract,
        address _walletAddress
        )
    {
        return (
            // kip7Token, 
            _nftToken, 
            _whiteListContract, 
            _walletAddress);
    }
    
}