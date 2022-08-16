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

function Test({KIP7Adr,minterAdr}) {
const [btnName, setBtnName] = useState(false)

  // const getOwnershipNftList = async ()=>{ //보유 NFT search
  //   let nftTokenID = []
  //   const contract = new caverExtKAS.klay.Contract(KIP17.abi,'0x5544775e57aa4C4D83c606971C03Da06324CC451');
  //   console.log('보유 nft수',await contract.methods.balanceOf(window.klaytn.selectedAddress).call()); 
  //   const getBlockEvent = await contract.getPastEvents('Transfer',{ filter:{to:[window.klaytn.selectedAddress],}, fromBlock: 96534898, toBlock:'latest'})
  //   console.log(getBlockEvent);
  //  for (const v of getBlockEvent) {
  //     const findOwner = await contract.methods.ownerOf(v.returnValues.tokenId).call(); 
  //     if(findOwner.toLowerCase() === window.klaytn.selectedAddress.toLowerCase()) {
  //       nftTokenID.push(v)
  //     }
  //  }
  //  setfirst(nftTokenID);
  //   const getOwnerListOfNft = async ()=>{ //보유 NFT자 리스트 search
  //     let map = new Map();
  //     const contract = new caverExtKAS.klay.Contract(KIP17.abi, '0x6b07cab0f2d7763162c18d649faa60d0e838e1b9');
  //     const getBlockEvent = await contract.getPastEvents('Transfer', {
  //         fromBlock: 96534898,
  //         toBlock: 'latest'
  //     });

  //     console.log(getBlockEvent); // 트랜잭션은 총 3개지만 사용된 토큰값은 0 과 1 2개밖에 없다. 민팅 0 , 1 , 1번 토큰 판매
  //     //자바스크립트에서 map key 값이 같으면 덮어써진다. 결과적으로 블럭을 처음부터 끝까지 가져 올 경우 최종값은 해당 nft 소유자만 남게 된다.
      
  //     getBlockEvent.forEach((result) => {
  //         map.set('토큰 아이디 : '+ result.returnValues.tokenId,'지갑 주소: ' + result.returnValues.to);
  //     });
  //     console.log(map);
  //   }
  //   getOwnerListOfNft()
  // }
  
  const unConnectklaytnWellet = async() =>{   //눈속임 진짜로 지갑 끊을려면 kaikas 설정에서 끊어야됨
    if (!window.confirm("지갑연결 끊으시겠습니까.")) {
    } else {
        setBtnName(false)
    }
  }

  const connectklaytnWellet = async() =>{
    const klaytnConnectSuccess = await window.klaytn.enable(); //지갑연결
    if(klaytnConnectSuccess){   //연결되면
      setBtnName(true)
      console.log('현제 지갑주소 :', klaytnConnectSuccess);
      console.log('네트워크 넘버 :',window.klaytn.networkVersion, window.klaytn.networkVersion===1001?'Testnet':'MainNet' );
      console.log('선택한 지갑주소:', window.klaytn.selectedAddress);
    }
  }

  const getSpender = async ()=>{
    const tokenValue =  caverExtKAS.utils.toPeb(110, 'KLAY')        //faovr 얼마로 할지

    const contract = new caverExtKAS.klay.Contract(MyToken.abi, KIP7Adr);
    const balance = await contract.methods.balanceOf(window.klaytn.selectedAddress).call()
    
    console.log(tokenValue);
    console.log('보유토큰',balance); 
    if(Number(balance)=== 0 ){
      alert('보유 토큰이없습니다. 관리자에게 문의하세요');
      return;
    }

    const gas = await contract.methods
      .mintWithTokenURI(minterAdr,tokenValue)
      .estimateGas({
        from: window.klaytn.selectedAddress,
        });

    const aprove = await contract.methods
      .mintWithTokenURI(minterAdr,tokenValue)
      .send({
        from: window.klaytn.selectedAddress,
        gas
        });
      console.log(aprove);
  }

  return (
    <div className="App">
      <header>
        {btnName
       ?
       <div>
         <button style={{width:'100px',height:'100px'}} onClick={unConnectklaytnWellet}>1. 지갑연결 끊기</button> <br /><br />
        <button style={{width:'100px',height:'100px'}} onClick={getSpender}>2. Favor approve</button>
       </div>
       :
       <div>
        <button style={{width:'100px',height:'100px'}} onClick={connectklaytnWellet}>1. 지갑연결</button> <br /><br />
        <button style={{width:'100px',height:'100px'}} disabled>2. Favor approve</button>
      </div>
      }
      </header>
    </div>
  );
}

export default Test;
