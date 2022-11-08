import React, { useState, useEffect, useCallback } from "react";
import {
  encrypt,
  recoverPersonalSignature,
  recoverTypedSignatureLegacy,
  recoverTypedSignature,
  recoverTypedSignature_v4 as recoverTypedSignatureV4,
} from "eth-sig-util";
import {
  hstBytecode,
  hstAbi,
  piggybankBytecode,
  piggybankAbi,
  collectiblesAbi,
  collectiblesBytecode,
  failingContractAbi,
  failingContractBytecode,
} from "./constants.json";
import MinterKIP17 from "./abi/MinterKIP17.json";
import { toChecksumAddress } from "ethereumjs-util";
import { ethers } from "ethers";

//설치여부
if (typeof window.ethereum !== "undefined") {
  console.log("MetaMask is installed!");
}
//지갑 연결 네트워크
const chainIdToNetworkName = (chainId) => {
  let network;
  switch (parseInt(chainId, 16)) {
    case 1:
      network = "Mainnet";
      break;
    case 3:
      network = "Ropsten";
      break;
    case 4:
      network = "Rinkeby";
      break;
    case 5:
      network = "Goerli";
      break;
    case 6:
      network = "Kovan";
      break;
    case 1337:
      network = "Localhost";
      break;
    case 31337:
      network = "Hardhat";
      break;
    case 80001:
      network = "Mumbai Testnet";
      break;
    case 137:
      network = "Polygon Mainnet";
      break;
    default:
      network = "Unknown";
      break;
  }
  return network;
};

function Test() {
  const [accounts, setAccounts] = useState("");
  const [Encryption, setEncryption] = useState("");
  const [Decryption, setDecryption] = useState("");
  const [nftaddress, setNftaddress] = useState(
    "0xFeD8349e51aF2645cEbeDf8De8BdB204b663F96D"
  );
  const [minterAddress, setMinterAddress] = useState(
    // "0x430e1280472785942dfBaADb3520587f66D4CcaC" //괴를리
    "0x02BF7FF497CF7E59313F022e6b7C9cBA12f2AE7e"    //뭄바이
  );
  const ethersProvider = new ethers.providers.Web3Provider(
    window.ethereum,
    "any"
  );
  /**지갑변경 이벤트 함수*/
  window.ethereum.on("accountsChanged", function (accounts) {
    console.log("지갑변경 이벤트 함수", accounts[0]);
    setAccounts(accounts[0]);
  });
  window.ethereum.on("chainChanged", (chainId) => {
    console.log(
      "블록체인 네트워크 변경 이벤트함수",
      chainIdToNetworkName(chainId)
    );
    // window.location.reload();
  });
  /** 지갑 연결 함수 */
  const connectEthWellet = async () => {
    const metamask = window.ethereum;
    if (metamask) {
      const address = await metamask.request({
        // method: "eth_accounts",   //주소만불러오는 메소드
        method: "eth_requestAccounts", //주소불러와주고 연결안되있으면 연결시켜주는 메소드
      });
      const network = await metamask.request({
        method: "eth_chainId",
      });
      const balance = await metamask.request({
        method: "eth_getBalance",
        params: [address[0], "latest"],
      });
      setAccounts(address[0]);
      console.log(address);
      console.log("connect network : ", chainIdToNetworkName(network));
      console.log("balance Of : ", parseInt(balance));
    }
  };
  /** 트렌잭션 보내기 */
  const sendTx = () => {
    window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts,
            to: "0x92962695B0a938974E65c22B1a7bcBA75430c895",
            value: "b1a2bc2ec50000", //0.05 ETH 16진수로들어감
            gasPrice: "0x09184e72a000",
            gas: "0x2710",
          },
        ],
      })
      .then((txHash) => console.log("트랜잭션 주소", txHash))
      .catch((error) => console.log("지갑연결 확인해주셈요", error));
  };
  /** 지갑에 토큰추가하기 */
  const walletAddToken = async () => {
    const tokenAddress = "0xd00981105e61274c8a5cd5a88fe7e037d935b513";
    const tokenSymbol = "TUT";
    const tokenDecimals = 18;
    const tokenImage = "http://placekitten.com/200/300";

    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log("Thanks for your interest!");
      } else {
        console.log("Your loss!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  /** 서명창띄우기 암호화*/
  const v4_OnSign = async () => {
    const network = await window.ethereum.request({
      method: "eth_chainId",
    });
    const chainId = parseInt(network, 16);
    const msgParams = {
      domain: {
        chainId: chainId.toString(),
        name: "Ether Mail",
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        version: "1",
      },
      message: {
        contents: "Hello, Bob!",
        from: {
          name: "Cow",
          wallets: [
            "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
          ],
        },
        to: [
          {
            name: "Bob",
            wallets: [
              "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
              "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
              "0xB0B0b0b0b0b0B000000000000000000000000000",
            ],
          },
        ],
      },
      primaryType: "Mail",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Group: [
          { name: "name", type: "string" },
          { name: "members", type: "Person[]" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person[]" },
          { name: "contents", type: "string" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallets", type: "address[]" },
        ],
      },
    };
    try {
      const from = await window.ethereum.request({
        method: "eth_requestAccounts", //주소불러와주고 연결안되있으면 연결시켜주는 메소드
      });
      const sign = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [from[0], JSON.stringify(msgParams)],
      });
      console.log(sign);
      setEncryption(sign);
    } catch (err) {
      console.error(err);
    }
  };
  /** 복호화 */
  const SignDecoding = async () => {
    const network = await window.ethereum.request({
      method: "eth_chainId",
    });
    const chainId = parseInt(network, 16);
    const msgParams = {
      domain: {
        chainId,
        name: "Ether Mail",
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        version: "1",
      },
      message: {
        contents: "Hello, Bob!",
        from: {
          name: "Cow",
          wallets: [
            "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
          ],
        },
        to: [
          {
            name: "Bob",
            wallets: [
              "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
              "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
              "0xB0B0b0b0b0b0B000000000000000000000000000",
            ],
          },
        ],
      },
      primaryType: "Mail",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Group: [
          { name: "name", type: "string" },
          { name: "members", type: "Person[]" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person[]" },
          { name: "contents", type: "string" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallets", type: "address[]" },
        ],
      },
    };
    try {
      const from = await window.ethereum.request({
        method: "eth_requestAccounts", //주소불러와주고 연결안되있으면 연결시켜주는 메소드
      });
      const sign = Encryption;
      const recoveredAddr = recoverTypedSignatureV4({
        data: msgParams,
        sig: sign,
      });
      console.log(recoveredAddr);
      console.log(from[0]);
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from[0])) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        setDecryption(recoveredAddr);
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from[0]}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };
  /** Deploy */
  const ERC721Deploy = async () => {
    let collectiblesFactory = new ethers.ContractFactory(
      collectiblesAbi,
      collectiblesBytecode,
      ethersProvider.getSigner()
    );
    let collectiblesContract;
    try {
      collectiblesContract = await collectiblesFactory.deploy();
      await collectiblesContract.deployTransaction.wait();
    } catch (error) {
      throw error;
    }
    if (collectiblesContract.address === undefined) {
      return;
    }
    console.log(
      `Contract mined! address: ${collectiblesContract.address} transactionHash: ${collectiblesContract.deployTransaction.hash}`
    );
    setNftaddress(collectiblesContract.address);
  };
  /** mint */
  const ERC721Mint = async () => {
    let collectiblesContract = new ethers.Contract(
      nftaddress,
      collectiblesAbi,
      ethersProvider.getSigner()
    );
    let result = await collectiblesContract.mintCollectibles(2, {
      from: accounts,
    });
    result = await result.wait();
    console.log(result);
  };
  /** approve */
  const ERC721approve = async () => {
    let collectiblesContract = new ethers.Contract(
      nftaddress,
      collectiblesAbi,
      ethersProvider.getSigner()
    );
    let result = await collectiblesContract.approve(
      "0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4",
      1, //count
      {
        from: accounts,
      }
    );
    result = await result.wait();
    console.log("Approve completed", result);
  };
  /** setApprovalForAllButton */
  const setApprovalForAllButton = async () => {
    let collectiblesContract = new ethers.Contract(
      nftaddress,
      collectiblesAbi,
      ethersProvider.getSigner()
    );
    let result = await collectiblesContract.setApprovalForAll(
      "0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4",
      true,
      {
        from: accounts,
      }
    );
    result = await result.wait();
    console.log("Set Approval For All completed", result);
  };
  /** transferFromButton  */
  const transferFromButton = async () => {
    let collectiblesContract = new ethers.Contract(
      nftaddress,
      collectiblesAbi,
      ethersProvider.getSigner()
    );
    console.log(collectiblesContract);
    console.log(accounts);
    let result = await collectiblesContract.transferFrom(
      accounts,
      "0x92962695B0a938974E65c22B1a7bcBA75430c895",
      1, //count
      {
        from: accounts,
      }
    );
    result = await result.wait();
    console.log("Transfer From completed", result);
  };
  /** 이벤트 가져오기 */
  const getEventValue = async () => {
    const provider = new ethers.providers.JsonRpcProvider("알크미나 인프라 주소넣어주셈");
    const toBlock =   15893639;
    const fromBlock = 10093639;
    let collectiblesContract = new ethers.Contract(
      "0x74cEDb4F333cB2e554349f498145e02952b920a9",
      collectiblesAbi,
      provider
    );
    console.log(
      await collectiblesContract.queryFilter("Transfer", fromBlock, toBlock)
    );
  };
  //튜토리얼 끝
  /** minting */
  const minterMinting = async () => {
    let collectiblesContract = new ethers.Contract(
      minterAddress,
      MinterKIP17.abi,
      ethersProvider.getSigner()
    );

    let minterInfo = await collectiblesContract.currentSaleId();
    console.log(minterInfo);
    let saleInfo = await collectiblesContract.getSaleInfo(minterInfo);
    console.log(saleInfo);
    console.log("판매회차", minterInfo, "트잭당개수", saleInfo.buyAmountPerTrx);

    let gasPrice = await collectiblesContract.estimateGas.whitelistSale(
      minterInfo,
      saleInfo.buyAmountPerTrx,
      {
        from: accounts,
        value: String(saleInfo.saleKlayAmount * saleInfo.buyAmountPerTrx),
      }
    );
    console.log(parseInt(gasPrice));
    /** 판매회차, 판매수량,  */
    let result = await collectiblesContract.whitelistSale(
      minterInfo,
      saleInfo.buyAmountPerTrx,
      {
        from: window.ethereum.selectedAddress,
        value: saleInfo.saleKlayAmount._hex,
        gasPrice: `0x${(3601002151).toString(16)}`, //TODO: 가스비계산해야됨
        // gasPrice: gasPrice, //TODO: 가스비계산해야됨
      }
    );
    result = await result.wait();
    console.log(result);
  };
  /** MintingEncodeing ethers tx 보내기*/
  const minterMintingEncodeingEthersSendTx = async () => {
    const signer = ethersProvider.getSigner();
    console.log(signer);
 
    let collectiblesContract = new ethers.Contract(
      minterAddress,
      MinterKIP17.abi,
      ethersProvider.getSigner()
    );

    let minterInfo = await collectiblesContract.currentSaleId();
    let saleInfo = await collectiblesContract.getSaleInfo(minterInfo);
    console.log("판매회차",parseInt(minterInfo),"트잭당개수",parseInt(saleInfo.buyAmountPerTrx));

    let iface = new ethers.utils.Interface(MinterKIP17.abi);
    let encode = iface.encodeFunctionData("whitelistSale", [
      minterInfo,
      saleInfo.buyAmountPerTrx,
    ]);
    console.log("encode :", encode);
    let params = {
      from: window.ethereum.selectedAddress, //내꺼지갑주소
      to: minterAddress, //어디로보낼지
      value: saleInfo.saleKlayAmount._hex, //이더
      data: encode, //코드
      gasPrice:`0x${(4356500027).toString(16)}`,   //TODO: 가스비계산해야됨
    };

    const txHash = await signer.sendTransaction(params);
    console.log("생성 해쉬 :", txHash);
    const result = await txHash.wait();
    console.log("Success", result);
  };
  /** MintingEncodeing 메타마스크로 tx 보내기 */
  const minterMintingEncodeing = async () => {
    // console.log(ethersProvider.getSigner());
    let collectiblesContract = new ethers.Contract(
      minterAddress,
      MinterKIP17.abi,
      ethersProvider.getSigner()
    );
    let minterInfo = await collectiblesContract.currentSaleId();
    let saleInfo = await collectiblesContract.getSaleInfo(minterInfo);
    console.log(
      "판매회차",
      parseInt(minterInfo),
      "트잭당개수",
      parseInt(saleInfo.buyAmountPerTrx)
    );

    let iface = new ethers.utils.Interface(MinterKIP17.abi);
    let encode = iface.encodeFunctionData("whitelistSale", [
      minterInfo,
      saleInfo.buyAmountPerTrx,
    ]);
    console.log("encode :", encode);

    let transactionHash;
    await window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: window.ethereum.selectedAddress, //내꺼지갑주소
            to: minterAddress, //어디로보낼지
            value: saleInfo.saleKlayAmount._hex, //이더
            data: encode, //코드
            gas: (294873).toString(16), //가스 16진수
            gasPrice: (3356500027).toString(16), //TODO: 가스비계산해야됨
          },
        ],
      })
      .then((txHash) => {
        console.log("트랜잭션 주소", txHash);
        transactionHash = txHash;
      })
      .catch((error) => console.error);
      ethersProvider.waitForTransaction(transactionHash).then(async (result) => {
        console.log(result);
        if (result.status === 0) { //0실패 1성공
          return alert("실패flase");
        } else {
          return alert("성공");
        }
      });
  };
  
  /** sendUncheckedTransaction */
  const sendUncheckedTransaction = async ()=>{
    let collectiblesContract = new ethers.Contract(
      minterAddress,
      MinterKIP17.abi,
      ethersProvider.getSigner()
    );
    let minterInfo = await collectiblesContract.currentSaleId();
    let saleInfo = await collectiblesContract.getSaleInfo(minterInfo);

    /**encode 만들어서 */
    // let iface = new ethers.utils.Interface(MinterKIP17.abi);
    // let encode = iface.encodeFunctionData("whitelistSale", [
    //   minterInfo,
    //   saleInfo.buyAmountPerTrx,
    // ]);
    // console.log("encode :", encode);
    // let params = {
    //   from: window.ethereum.selectedAddress, //내꺼지갑주소
    //   to: minterAddress, //어디로보낼지
    //   value: saleInfo.saleKlayAmount._hex, //이더
    //   data: encode, //코드
    //   gasPrice:`0x${(4356500027).toString(16)}`,   //TODO: 가스비계산해야됨
    // };

    /**바로  */
    let result = await collectiblesContract.populateTransaction.
    whitelistSale(
      minterInfo,
      saleInfo.buyAmountPerTrx,
      {
        from: window.ethereum.selectedAddress,
        value: saleInfo.saleKlayAmount._hex,
        gasPrice: `0x${(3601002151).toString(16)}`, //TODO: 가스비계산해야됨
      }
    );
    console.log(result);
    let signer = ethersProvider.getSigner()
    let hash = await signer.sendUncheckedTransaction(result);
    console.log(hash);

    ethersProvider.waitForTransaction(hash).then(async (result) => {
      console.log(result);
      if (result.status === 0) { //0실패 1성공
        return alert("실패flase");
      } else {
        return alert("성공");
      }
    });
  }

  /** 바로 tx보내기 연속민팅용*/
  const metamaskNusignSendTx = async () => {
    const signer = new ethers.Wallet("비밀키 입력발마", ethersProvider);
    console.log("연결된 Wallet address ;", signer.address);
    
    let collectiblesContract = new ethers.Contract(
      minterAddress,
      MinterKIP17.abi,
      signer //지갑넣기 signer 생겨있음
    );
    console.log(
      "컨트렉트에 연결되어있는 지갑주소:",
      collectiblesContract.signer.address
    );

    let minterInfo = await collectiblesContract.currentSaleId();
    let saleInfo = await collectiblesContract.getSaleInfo(minterInfo);
    console.log(
      "판매회차",
      parseInt(minterInfo),
      "트잭당개수",
      parseInt(saleInfo.buyAmountPerTrx)
    );

    let result = await collectiblesContract.whitelistSale(
      minterInfo,
      saleInfo.buyAmountPerTrx,
      {
        value: String(saleInfo.saleKlayAmount * saleInfo.buyAmountPerTrx),
      }
    );
    console.log("pending Tx :", result.hash);
    result = await result.wait();

    console.log("Success", result);
  };

  
  return (
    <div className="App">
      <header>
        <div>
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={connectEthWellet}
          >
            1. 지갑연결
          </button>
          <br />
          <button style={{ width: "220px", height: "50px" }} onClick={sendTx}>
            2. send transaction
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={walletAddToken}
          >
            3.토큰목록 추가하기
          </button>
          <br />
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={v4_OnSign}
          >
            4. v4_사인창띄우기 암호화
          </button>
          <h>{Encryption}</h>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={SignDecoding}
          >
            5. 사인값으로 복호화
          </button>
          <h>{Decryption}</h>
          <br />
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={ERC721Deploy}
          >
            6. 721contract Deploy
          </button>
          <h>{nftaddress}</h>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={ERC721Mint}
          >
            7. NFT mint
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={ERC721approve}
          >
            8. approve
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={setApprovalForAllButton}
          >
            9. setApprovalForAllButton
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={transferFromButton}
          >
            10. transferFromButton
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={getEventValue}
          >
            11. 이벤트 불러오기
          </button>
          <br />
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={minterMinting}
          >
            11. 민팅이 조건이맞을 때만 사인창뜸 <br /> 가스비계산후 보냄
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={minterMintingEncodeingEthersSendTx}
          >
            12. 사인창 조건맞을때 생성<br />(ethers로 트젝보내기)
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={minterMintingEncodeing}
          >
            13. 사인창 무조건뜸 <br />(메타마스크로 트젝보내기)
          </button>
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={sendUncheckedTransaction}
          >
            14. 사인창 무조건띄우기  <br />안되나봄 메타마스크에서 오류뱉음
            encode변환후 트랜잭션 사인해서 보내기 or 데이터 사인전 만들고 데이터에 사인해서 해쉬값넘김기
          </button>
          <br />
          <br />
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={metamaskNusignSendTx}
          >
            15. 사인창없이 바로 tx
          </button>
        </div>
      </header>
    </div>
  );
}

export default Test;
