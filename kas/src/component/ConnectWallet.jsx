import React,{useState,useEffect,useCallback} from 'react'
import MinterKIP17 from'../abi/MinterKIP17.json'
import KIP17 from'../abi/OwnableKIP17.json'

export default function ConnectWallet({caver,caverExtKAS}) {
const MinterAddress = '0x7c6C70AB930E5637f5F862629A67D47C3403cC34'      //env로빼야될듯?
const [amount, setAmount] = useState(1)

const [saleInfo, setSaleInfo] = useState({
  saleId:"",
  currentSaleType:"",
  buyAmountPerTrx:"",         //트랜잭션당 구매가능
  buyAmountPerWallet: "",     //지갑당구매가능
  lastSaleTokenId: "",        //판매가능 수량
  saleKIP7Amount: "",         //상관 x
  saleKlayAmount: "",         //구매가격
  startBlockNumber: ""        //시작 블록
})
const [btnName, setBtnName] = useState(false)
const [walletAddress, setWalletAddress] = useState('')

useEffect(() => {
  if(caverExtKAS!==null){
    const getInfo =async ()=>{
      const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,MinterAddress); 
      const saleId = await contract.methods.currentSaleId().call();
      const isOpen = await contract.methods.isOpen().call();
      const currentSaleType = await contract.methods.currentSaleType().call();
      console.log(currentSaleType);
      
      let data = await contract.methods.getSaleInfo(saleId).call()
      data = {
          ...data,
          saleId,
          currentSaleType:Number(currentSaleType),  //0이면 화이트리스트 1이면 퍼블
          isOpen,
          saleKlayAmount:caverExtKAS.utils.fromPeb(data.saleKlayAmount,'KLAY'), //peb단위에서 klay 단위로 변환
          lastSaleTokenId : Number(data.lastSaleTokenId)+1    //0부터 99까지니깐 +1 해줌
      }  
      setSaleInfo(data)
  
    }
    getInfo()
    // if(window.klaytn.networkVersion===1001){
    //   alert('Kaikas net-work versoin check!' );
    // }
}
}, [caverExtKAS])


window.klaytn.on('accountsChanged',function(accounts){    //wallet address change event 함수
  console.log(accounts)
})

const activate = async () => {  //지갑연결시 klaytn 설치여부  
  if (!window.klaytn) {
    if (navigator.userAgent.indexOf('Mobi') > -1) {
      alert(
        "민팅은 PC 웹에서만 사용 가능합니다."
      );
      return;
    }
    alert(
      "카이카스를 설치해 주세요. 카이카스는 PC 웹에서만 사용 가능합니다."
    );
    window.open(
      "https://chrome.google.com/webstore/detail/kaikas/jblndlipeogpafnldhgmapagcccfchpi"
    );
    return;
  }
};

const connectklaytnWellet = async() =>{
  activate();
  const klaytnConnectSuccess = await window.klaytn.enable(); //지갑연결
  if(klaytnConnectSuccess){   //연결되면
    setBtnName(true)
    setWalletAddress(klaytnConnectSuccess);
    console.log('현제 지갑주소 :', klaytnConnectSuccess);
    console.log('네트워크 넘버 :',window.klaytn.networkVersion, window.klaytn.networkVersion===1001?'Testnet':'MainNet' );
    console.log('선택한 지갑주소:', window.klaytn.selectedAddress);
  }
}

const unConnectklaytnWellet = async() =>{   //눈속임 진짜로 지갑 끊을려면 kaikas 설정에서 끊어야됨
  if (!window.confirm("지갑연결 끊으시겠습니까.")) {
  } else {
      setBtnName(false)
  }
  
}

const mint = async ()=>{
  const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,MinterAddress);
  const sendContract = new caver.klay.Contract(KIP17,'0x8f5aa6b6dcd2d952a22920e8fe3f798471d05901');
  const value = caverExtKAS.utils.toPeb(saleInfo.saleKlayAmount,'KLAY')*amount;  //peb단위로 변환후 *amount

  if(saleInfo.currentSaleType === 0){ //WL
    try {
      // const gas =await contract.methods
      // .whitelistSale(saleInfo.saleId,amount)     //가스비 계산해서
      // .estimateGas({
      //   from: window.klaytn.selectedAddress,
      //   value});
      const send = await sendContract.methods.balanceOf(window.klaytn.selectedAddress).call() //민팅보냄
      console.log(send);
      if (send) {
        alert(
          `${amount}장 민팅에 성공하였습니다.`
        );
      }
    }  catch (error) {const message = error?.message;
      console.log(message);
      if (message?.includes("User denied transaction")) {
        return alert(
          "요청을 취소하였습니다."
        );
      }
      if (message?.includes('Invalid "from" address')) {
        return alert(
          "현재 연결한 지갑 정보를 확인해 주세요."
        );
      }
      alert("민팅에 실패하였습니다.");
    };
  }else if(saleInfo.currentSaleType === 1 ){ //public
     try {
      const gas =await contract.methods   //가스비 계산해서
        .publicSale(saleInfo.saleId,amount)
        .estimateGas({
          from: window.klaytn.selectedAddress,
          value,});

      const send = await sendContract.methods //민팅보냄
        .publicSale(saleInfo.saleId,amount)
        .send({
          from: window.klaytn.selectedAddress,
          value,
          gas});
       
      if (send) {
        alert(
          `${amount}장 민팅에 성공하였습니다.`
         );
        }
      }catch (error) {const message = error?.message;
        console.log(message);
        if (message?.includes("User denied transaction")) {
          return alert(
            "요청을 취소하였습니다."
          );
        }
        if (message?.includes('Invalid "from" address')) {
          return alert(
            "현재 연결한 지갑 정보를 확인해 주세요."
          );
        }
        alert("민팅에 실패하였습니다.");
      };
  }
}

  return (
    <div>ConnectWallet  <br/>Saleinfo :{saleInfo.currentSaleType===0?'Whitelist':'Public'}
      <div>
          <button onClick={()=>{setAmount(amount-1)}}>- </button>
          구매수량: {amount}
          <button onClick={()=>{setAmount(amount+1)}}>+ </button>
      </div>
       {btnName
       ?
       <div>
         <button style={{width:'100px',height:'100px'}} onClick={unConnectklaytnWellet}> {walletAddress}</button>
         <button style={{width:'100px',height:'100px'}} onClick={mint}>민팅버튼 </button>
       </div>
       :
       <div>
        <button style={{width:'100px',height:'100px'}} onClick={connectklaytnWellet}> 지갑연결해주세요</button>
        <button style={{width:'100px',height:'100px'}} disabled> 민팅버튼</button>
      </div>
       }
    </div>
  )
}
