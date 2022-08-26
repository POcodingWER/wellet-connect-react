import React,{useState,useEffect,useCallback} from 'react'
import CaverExtKAS from'caver-js-ext-kas'
import Caver from'caver-js'
import MyToken from'./abi/MyToken.json'
import KIP17 from'./abi/OwnableKIP17.json'

const accessKeyId = "";
const secretAccessKey = "";
const chainId = window.klaytn.networkVersion // for Baobab; 8217 if Cypress
const caver = new Caver(window.klaytn);
let caverExtKAS

if(accessKeyId===""||secretAccessKey===""){   //kasAPI
    caverExtKAS = new Caver(window.klaytn);
  }else{
    caverExtKAS = new CaverExtKAS(chainId, accessKeyId, secretAccessKey);
}

function Test() {
  const connectklaytnWellet = async() =>{
    const klaytnConnectSuccess = await window.klaytn.enable(); //지갑연결
    if(klaytnConnectSuccess){   //연결되면
      console.log('현제 지갑주소 :', klaytnConnectSuccess);
      console.log('네트워크 넘버 :',window.klaytn.networkVersion, window.klaytn.networkVersion===1001?'Testnet':'MainNet' );
      console.log('선택한 지갑주소:', window.klaytn.selectedAddress);
    }
  }
  const cotractAddress ='0x69f70cc86CD080bB5038332D9c95cA9676Cd7e7A'

  const mint = async ()=>{    //가스비계산 통신 2번
    console.log('지갑연결유무:', window.klaytn.selectedAddress);
    const contract = new caverExtKAS.klay.Contract(KIP17.abi, cotractAddress);
    const balance = await contract.methods.totalSupply().call()
    
    console.log('보유토큰',balance); 

    const gas = await contract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress,balance,'naver.com')
      .estimateGas({
        from: window.klaytn.selectedAddress,
        });
    console.log(gas);
    
    const aprove = await contract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress,balance,'naver.com')
      .send({
        from: window.klaytn.selectedAddress,
        gas
        });
      console.log(aprove);
  }

  const mint2 = async ()=>{   //계산없이 통신 1번
    const tokenValue =  caverExtKAS.utils.toPeb(110, 'KLAY')        //faovr 얼마로 할지

    const contract = new caverExtKAS.klay.Contract(KIP17.abi, cotractAddress);
    const balance = await contract.methods.totalSupply().call()
    
    console.log(tokenValue);
    console.log('보유토큰',balance); 

    const data = await contract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress,balance,'naver.com')
      .encodeABI();
    console.log(data);

    const params = {
      type: "SMART_CONTRACT_EXECUTION",
      from: caverExtKAS.utils.toChecksumAddress(window.klaytn.selectedAddress),   //보내는사람주소
      to: caverExtKAS.utils.toChecksumAddress(cotractAddress),  //컨트랙트주소
      data,
    }
    
    const res = await caver.klay.sendTransaction({
      ...params,
      gas:1829110,
     });
    console.log(res);
  }

  const noSingSendTx = async () => {   //사인없이 트잭보내기
    /** 키링생성 */
    const senderKeyring = await caver.wallet.keyring.create(
      "퍼블키",
      "프라이빗키"
    );
    console.log(senderKeyring);
    caver.wallet.add(senderKeyring);
    /** mint1, mint2 랑다름 caver.contract.create을해야 안에 _wallet이 추가되어 있음*/
    const contract = new caver.contract.create(KIP17.abi, cotractAddress);
    console.log(contract);
    const balance = await contract.methods.totalSupply().call();
    const receipt = await contract.send(
      {
        from: senderKeyring.address,
        gas: 1000000,
      },
      "mintWithTokenURI", //메소드
      senderKeyring.address,
      balance,
      "naver.com"
    );
    console.log('생성txHash :',receipt.transactionHash);    //딜레이가 조금생김
  };

  return (
    <div className="App">
      <header>
       <div>
       <button style={{width:'100px',height:'100px'}} onClick={connectklaytnWellet}>1. 지갑연결</button> <br /><br />
        <button style={{width:'100px',height:'100px'}} onClick={noSingSendTx}>2. Favor approve</button>
       </div>
      
      </header>
    </div>
  );
}

export default Test;
