import React, { useState, useEffect, useCallback } from "react";
import {
  encrypt,
  recoverPersonalSignature,
  recoverTypedSignatureLegacy,
  recoverTypedSignature,
  recoverTypedSignature_v4 as recoverTypedSignatureV4,} from 'eth-sig-util';
import { toChecksumAddress } from 'ethereumjs-util';

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
      console.log("balance Of : ", parseInt(balance, 16));
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
      .catch((error) => console.error);
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
  const v4_OnSign = async ()=>{
    const network = await window.ethereum.request({
      method: "eth_chainId",
    });
    const chainId = parseInt(network, 16)
    const msgParams = {
      domain: {
        chainId: chainId.toString(),
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };
    try {
      const from = await window.ethereum.request({
        method: "eth_requestAccounts", //주소불러와주고 연결안되있으면 연결시켜주는 메소드
      });;
      const sign = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
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
      const recoveredAddr =  recoverTypedSignatureV4({
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
      }ddwdsdasdsdsfadsf1324e112`232323`
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="App">
      <header>
        <div>
          <button
            style={{ width: "150px", height: "50px" }} onClick={connectEthWellet}>1. 지갑연결</button>
          <br />
          <button style={{ width: "150px", height: "50px" }} onClick={sendTx}>2. send transaction</button>
          <br />
          <button style={{ width: "150px", height: "50px" }} onClick={walletAddToken}>3.토큰목록 추가하기 </button>
          <br />
          <button style={{ width: "150px", height: "50px" }} onClick={v4_OnSign}>4. v4_사인창띄우기 암호화 </button>
          <h >{Encryption}</h>
          <br />
          <button style={{ width: "150px", height: "50px" }} onClick={SignDecoding}>5. 사인값으로 복호화 </button>
          <h >{Decryption}</h>
        </div>
      </header>
    </div>
  );
}

export default Test;
