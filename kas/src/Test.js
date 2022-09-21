import React,{useState,useEffect,useCallback} from 'react'
import CaverExtKAS from'caver-js-ext-kas'
import Caver from'caver-js'
import MyToken from'./abi/MyToken.json'
import KIP17 from'./abi/OwnableKIP17.json'
import MinterKIP17 from'./abi/MinterKIP17.json'
import changeNft from'./abi/changeNft.json'

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
  const cotractAddress ='0x313b28ba15a318338f81ae49373e3cca6ba21fbe'

  const connectklaytnWellet = async() =>{
    const klaytnConnectSuccess = await window.klaytn.enable(); //지갑연결
    if(klaytnConnectSuccess){   //연결되면
      console.log('현제 지갑주소 :', klaytnConnectSuccess);
      console.log('네트워크 넘버 :',window.klaytn.networkVersion, window.klaytn.networkVersion===1001?'Testnet':'MainNet' );
      console.log('선택한 지갑주소:', window.klaytn.selectedAddress);
    }
  }

  const getGasFee = async (amount) => {
    const base = 7311325;
    const percount = 184800;
    return Math.ceil((base + amount * percount) * 1.2);
  };

  const 연속민트 = async () => {
    const senderKeyring = await caver.wallet.keyring.create(
      "공개키",
      "비밀키"
    );
    caver.wallet.add(senderKeyring);
    const sendContract = new caver.contract.create(  //자동
    changeNft.abi,
      "0xFef3e0f9B76C2fcA3dC17d50CCD2372EA83d0f3D");
    // const gas = await sendContract.methods
    //   .NFTReveal([])
    //   .estimateGas({
    //     from: senderKeyring.address,
    //     });
    // 2,401

    for (let i = 0; i < 10000; i+=10 ) {
      //20개잡고하면될듯  처음가스비 2328492  6389212 error 8000000미만으로 나오게 설정해야될듯
      const gas = await sendContract.methods
      .NFTReveal([i,i+1,i+2,i+3,i+4,i+5,i+6,i+7,i+8,i+9])
      .estimateGas({
        from: senderKeyring.address,
        });
        console.log(gas);
      const receipt = await sendContract.send(
        {
          from: senderKeyring.address,
          gas:gas,
        },
        "NFTReveal", //메소드
        [i,i+1,i+2,i+3,i+4,i+5,i+6,i+7,i+8,i+9],
        );
        console.log(gas,i,receipt);
        // const saleInfo = await sendContract.methods.isOpen().call();
        // console.log(i,receipt.events);

        // if (map1.get(receipt)) {
        //   console.log('있음',i,receipt);
        //   break;
        // }
        // map1.set(receipt,i)
    }
  };

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

  const noSignSendTx = async () => {   //사인없이 트잭보내기
    /** 키링생성 */
    const senderKeyring = await caver.wallet.keyring.create(
      
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

  const findTokenNum = async () => {
    console.log("지갑연결유무:", window.klaytn.selectedAddress);
    const contract = new caverExtKAS.klay.Contract(KIP17.abi, cotractAddress);
    
    const balance = await contract.methods.totalSupply().call();
    console.log("총발행 토큰", balance);

    let countNFT = await contract.methods
      .balanceOf(window.klaytn.selectedAddress)
      .call();
      console.log('보유개수',countNFT);
    let nftTokenIdArray = [];
    for (let i = 0; i < countNFT; i++) {
      nftTokenIdArray.push(
        await contract.methods
          .tokenOfOwnerByIndex(window.klaytn.selectedAddress, i)
          .call()
      );
    }
    console.log('보유토큰 num: ', nftTokenIdArray);
  };

  const ttttttt = async () => {
    console.log("지갑연결유무:", window.klaytn.selectedAddress);
    const contract = new caverExtKAS.klay.Contract(KIP17.abi, '0xc61cec228d97ee441bc9dd55004dc78c26797d70');
    
    const balance = await contract.methods.totalSupply().call();
    console.log("총발행 토큰", balance);

    let countNFT = await contract.methods
      .setApprovalForAll('0xFef3e0f9B76C2fcA3dC17d50CCD2372EA83d0f3D',1)
      .send( {from: window.klaytn.selectedAddress,gas:100000});
      console.log('보유개수',countNFT);
  };

  const 뽑기 = async () => {
    console.log("지갑연결유무:", window.klaytn.selectedAddress);
    const contract = new caverExtKAS.klay.Contract(KIP17.abi, '0xce70eef5adac126c37c8bc0c1228d48b70066d03');
    
    const balance = await contract.methods.balanceOf('0x0b0cd3a57dc9cedf3763e16e3d156dd71dae15f7').call();
    console.log("총발행 토큰", balance);

    let nftBox =[]
    for (let i = 0; i < 1; i++) {
      const nftNum = await contract.methods.tokenOfOwnerByIndex('0x0b0cd3a57dc9cedf3763e16e3d156dd71dae15f7',i).call();
      nftBox.push(nftNum)
      
      const metadata = `https://belly.bellygom.world/${nftNum}.json`
      fetch(metadata, { method : "GET"})
      .then((res) => res.json())
      .then(res => {                        //실제 데이터를 상태변수에 업데이트
        console.log(1, res);
    });
    }
    console.log(nftBox.length,nftBox);
    // let countNFT = await contract.methods
    //   .setApprovalForAll('0xFef3e0f9B76C2fcA3dC17d50CCD2372EA83d0f3D',1)
    //   .send( {from: window.klaytn.selectedAddress,gas:100000});
    //   console.log('보유개수',countNFT);
  };
  return (
    <div className="App">
      <header>
        <div>
            <button style={{width:'100px',height:'100px'}} onClick={connectklaytnWellet}>1. 지갑연결</button> <br /><br />
            <button style={{width:'100px',height:'100px'}} onClick={연속민트}>2. 연속민팅</button>
            <button style={{width:'100px',height:'100px'}} onClick={mint}>2. 조건맞을때 사인창</button>
            <button style={{width:'100px',height:'100px'}} onClick={mint2}>2. 사인창 무조건열림</button>
            <button style={{width:'100px',height:'100px'}} onClick={noSignSendTx}>2. 사인없이 트잭보내기</button>
            <button style={{width:'100px',height:'100px'}} onClick={findTokenNum}>3. 보유중인 nft다찾기</button>
            <button style={{width:'100px',height:'100px'}} onClick={ttttttt}>3. ttttttttttttt</button>
            <button style={{width:'100px',height:'100px'}} onClick={뽑기}>3. 뽑기</button>
        </div>
      </header>
    </div>
  );
}

export default Test;
