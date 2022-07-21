import React,{useState,useEffect,useRef} from 'react'
import MinterKIP17 from'../abi/MinterKIP17.json'

export default function GetSaleInfo({caverExtKAS}) {
const MinterAddress = '0x7c6C70AB930E5637f5F862629A67D47C3403cC34'      //env로빼야될듯?
const [blockNumber, setBlockNumber] = useState();   //블록 대략 1초마다생성 10초에 한번씩 sync 조절
const blockNumberRef = useRef(0);

const [NftNum, setNftNum] = useState('')
const [saleInfo, setSaleInfo] = useState({
    saleId:"",
    buyAmountPerTrx:"",         //트랜잭션당 구매가능
    buyAmountPerWallet: "",     //지갑당구매가능
    lastSaleTokenId: "",        //판매가능 수량
    saleKIP7Amount: "",         //상관 x
    saleKlayAmount: "",         //구매가격
    startBlockNumber: ""        //시작 블록
})


useEffect(() => {   //current block sync
    let index = 0;
    const MAX = 10;
    
    const interval = setInterval(() => {
      index += 1;
      if (blockNumberRef.current === 0) {   //처음에 블록 넘버가져오고
        caverExtKAS?.rpc?.klay
          ?.getBlockNumber()
          .then((res) => {
            setBlockNumber(caverExtKAS?.utils?.hexToNumber(res));
            blockNumberRef.current = caverExtKAS?.utils?.hexToNumber(res);
          })
          .catch(() => 0);
      } else if (index === MAX) {       //10초에한번씩  sync 맞추고
        console.log("sync!!");
        caverExtKAS?.rpc?.klay
          ?.getBlockNumber()
          .then((res) => {
            setBlockNumber(caverExtKAS?.utils?.hexToNumber(res));
            blockNumberRef.current = caverExtKAS?.utils?.hexToNumber(res);
          })
          .catch(() => 0);
        index = 0;
      } else {      //1초에 한번씩 +1
        const num = blockNumberRef.current + 1;
        setBlockNumber(num);
        blockNumberRef.current = num;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

const getInfo =async ()=>{
    const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,MinterAddress); 
    const saleId = await contract.methods.currentSaleId().call();
    let data = await contract.methods.getSaleInfo(saleId).call()
    data = {
        ...data,
        saleId,
        saleKlayAmount:caverExtKAS.utils.fromPeb(data.saleKlayAmount,'KLAY'), //peb단위에서 klay 단위로 변환
        lastSaleTokenId : Number(data.lastSaleTokenId)+1    //0부터 99까지니깐 +1 해줌
    }  
    setSaleInfo(data)
    console.log(saleInfo);
}

const getNftCounter =async ()=>{
    const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,MinterAddress); 
    const data = await contract.methods.tokenIdCounter().call();
    console.log(data);
    setNftNum(data);
}

  return (
    <div><br/> GetSaleInfo
        <div style={{fontSize:'20px'}}>
            현재 블럭수 : {blockNumber ? blockNumber : "00000000"}<br/><br/>
            <button style={{width:'100px',height:'100px'}} onClick={getInfo}> GetSaleInfo</button>
                <br />현제 saleid : {saleInfo.saleId}
                <br />한번에구매가능수 : {saleInfo.buyAmountPerTrx}
                <br />지갑당구매가능수 : {saleInfo.buyAmountPerWallet}
                <br />총판매 NFT : {saleInfo.lastSaleTokenId}
                <br />판매가격 : {saleInfo.saleKlayAmount}
                <br />시작가능 블럭수 : {saleInfo.startBlockNumber}<br />
            <button style={{width:'100px',height:'100px'}} onClick={getNftCounter}> 총발행량 조회</button> 현재까지 발행 : {NftNum}<br />
        </div>
    </div>
  )
}
