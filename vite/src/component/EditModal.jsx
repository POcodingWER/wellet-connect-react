import React,{useState,useEffect} from 'react'
import './Modal.css'
import dayjs from 'dayjs';
import OwnableKIP17 from '../abi/MinterKIP17.json'

export default function EditModal({setModal,mintadr,modalInfo}) {
  const [startBlockNumber, setStartBlockNumber] = useState(0); 
  const [currentBlockTime, setCurrentBlockTime] = useState(0);
  const [lastSaleTokenId, setLastSaleTokenId] = useState(0);
  const [buyAmountPerWallet, setBuyAmountPerWallet] = useState(0);
  const [buyAmountPerTrx, setBuyAmountPerTrx] = useState(0);
  const [saleKlayAmount, setSaleKlayAmount] = useState(0);

  useEffect(() => {
      setStartBlockNumber(modalInfo.startBlockNumber);
      setCurrentBlockTime(modalInfo.time);
      setLastSaleTokenId(modalInfo.lastSaleTokenId);
      setBuyAmountPerWallet(modalInfo.buyAmountPerWallet);
      setBuyAmountPerTrx(modalInfo.buyAmountPerTrx);
      setSaleKlayAmount(modalInfo.klayc);
 
  }, []);

  const blockNumberToTimestamp = async (blockNumber) => {
    let block;
    try {
      block = await window.caver.klay.getBlock(blockNumber);
      return parseInt(block.timestamp);
    } catch (e) {
      const currentBlockNumber = parseInt(await window.caver.klay.getBlockNumber());
        const currentBlockTimestamp = await blockNumberToTimestamp(
          currentBlockNumber
          );
          console.log(currentBlockTimestamp)
      return (
        currentBlockTimestamp +
        parseInt(blockNumber) -
        parseInt(currentBlockNumber)
      );
    }
  };

  const changeDate = async (e)=>{
    setCurrentBlockTime(e.target.value)
    const timestamp = dayjs(e.target.value,'YYYY-MM-DD HH:mm:ss').unix();
    const currentTimestamp = parseInt(Date.now() / 1000); 
    console.log('바꾼거',timestamp,'현재시간',currentTimestamp);

    const currentBlockNumber = parseInt(await window.caver.klay.getBlockNumber());
    console.log('현재블록num',currentBlockNumber)

    const currentBlockTimestamp = await blockNumberToTimestamp(currentBlockNumber);
    console.log('현재 블록타임',currentBlockTimestamp);

    if (currentTimestamp <= timestamp){ 
      const updateTime =  currentBlockNumber + (timestamp - currentBlockTimestamp); //현재블록 + (받은시간 -현재타임)
      setStartBlockNumber(updateTime);
      console.log(updateTime);
    }
  }

  const setSaleInfo = async ()=>{
    const peb =await window.caver.utils.toPeb(saleKlayAmount, 'KLAY');  //klay ->peb

    const info =[
      Number(modalInfo.saleId),
      Number(startBlockNumber),
      Number(lastSaleTokenId),
      Number(buyAmountPerWallet),
      Number(buyAmountPerTrx),
      peb
    ];
    
    if (!klaytn.selectedAddress) {
      return alert('지갑연결을 확인하세요');
    }
    if (
      Number(startBlockNumber) === 0 ||
      Number(lastSaleTokenId) === 0 ||
      Number(buyAmountPerWallet) === 0 ||
      Number(buyAmountPerTrx) === 0 ||
      Number(saleKlayAmount) === 0 
    ) {
      return alert('입력값을 모두 입력하세요');
    }
    const contract = new window.caver.klay.Contract(OwnableKIP17.abi,mintadr);

    const gas = await contract.methods   //가스비 계산해서
    .setSaleInfo(...info )
    .estimateGas({from:klaytn.selectedAddress});



    const setSaleInfo = await contract.methods
      .setSaleInfo(...info )
      .send({
        from:klaytn.selectedAddress,
        gas 
      })

    if (setSaleInfo.status) {
      alert('저장되었습니다.');
      window.location.reload();
    } else {
      alert('실패하였습니다.');
    }
  }

  return (
    <div className='bgcolor'>
        <div className='modal'>
        <h2>판매정보 등록</h2>
        <hr />
        <h4>판매시작 블록번호</h4>
          블록시작번호 : <input placeholder="99로끝나게" type='number' value={startBlockNumber} onChange={(e)=>setStartBlockNumber(e.target.value)}/>
          &nbsp;
          판매할 시간  : <input placeholder="YYYY-MM-DD HH:mm:ss" value={currentBlockTime} onChange={changeDate}/>
        <h4>판매할 토큰 ID번호(끝번호)</h4>
          <input placeholder="99로끝나게" type='number' min="0" value={lastSaleTokenId} onChange={(e)=>setLastSaleTokenId(e.target.value)}/>
          <br/>
          <small>만약,99으로 설정시 tokenId 0(현재까지 판매수량)~99까지 총 100장 판매 가능</small>
        <h4>지갑당 구매 가능 수</h4>
          <input placeholder="1" type='number' min="0" value={buyAmountPerWallet} onChange={(e)=>setBuyAmountPerWallet(e.target.value)}/>
        <h4>1회(트랜잭션)당 구매 가능 수</h4>
          <input placeholder="1" type='number' min="0" value={buyAmountPerTrx} onChange={(e)=>setBuyAmountPerTrx(e.target.value)}/>
          <br/>
          <small>지갑 당 구매 가능 수보다 같거나 작아야한다.</small>
        <h4>판매할 klay</h4>
          <input placeholder="1" type='number' min="0" value={saleKlayAmount} onChange={(e)=>setSaleKlayAmount(e.target.value)}/>
          <hr/><br/>
          <div className='btn'>
            <button onClick={()=>setModal(false)}>Close</button>&nbsp;&nbsp;
            <button onClick={setSaleInfo}>Save&Change</button>
          </div> 
        </div>
    </div>
  )
}
