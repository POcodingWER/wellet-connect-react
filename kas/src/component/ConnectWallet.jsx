import React,{useState,useEffect} from 'react'
import MinterKIP17 from'../abi/MinterKIP17.json'

export default function ConnectWallet({caver,caverExtKAS}) {
const MinterAddress = '0x73E04De07e0D2169408fefFeB0B76f36aC578036'      //env로빼야될듯?
const amount = 1;   //구매수량 

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
}
}, [caverExtKAS])


window.klaytn.on('accountsChanged',function(accounts){    //wallet address change event 함수
  console.log(accounts)
})

const connectklaytnWellet = async() =>{
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
  console.log(saleInfo);
  const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,MinterAddress);
  // if(saleInfo.currentSaleType === 0){ //WL
  //   const value = caverExtKAS.utils.toPeb(saleInfo.saleKlayAmount,'KLAY')*amount;  //peb단위로 변환후 *amount
    
  // }else if(saleInfo.currentSaleType ===1 ){ //public
  //   const value = caverExtKAS.utils.toPeb(saleInfo.saleKlayAmount,'KLAY')*amount;  //peb단위로 변환후 *amount
  //   console.log(window.klaytn.selectedAddress)

    
  // }
   const gas =await contract.methods   //가스비 계산해서
    .publicSale(1,1)
    .estimateGas({from: window.klaytn.selectedAddress,
      value:"1000000000000000000",});
    console.log(gas);
    
    console.log(gas)

  



}

  return (
    <div>ConnectWallet  <br/>Saleinfo :{saleInfo.currentSaleType===0?'Whitelist':'Public'}
      
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
