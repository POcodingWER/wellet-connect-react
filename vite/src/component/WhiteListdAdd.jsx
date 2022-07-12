import React,{useState} from 'react'
import Whitelist from'../abi/Whitelist.json'
import { Link, Outlet } from "react-router-dom";
import _ from 'lodash';

export default function WhiteListdAdd({WhiteListadr}) {
  const utils = window.caver.utils
  const contract = new window.caver.klay.Contract(Whitelist.abi,WhiteListadr);
  const [saleId, setSaleId] = useState("");
  const [checkWhiteList, setCheckWhiteList] = useState("");

  const [saleId2, setsaleId2] = useState("");
  const [checkWallet, setCheckWallet] = useState("");
  const [checkWhiteList2, setCheckWhiteList2] = useState("");

  const [saleId3, setsaleId3] = useState("");
  const [addWhiteList, setAddWhiteList] = useState("");
  

  const checkWhiteListHandler = async()=>{
    if (!saleId) {
      return alert("판매 회차를 입력하세요.");
    }
    const checkValue = await contract.methods
      .saleWhitelistCount(saleId)
      .call();
      setCheckWhiteList(checkValue);
  }

  const checkWhiteListWalletHandler = async()=>{
    if (!saleId2 || !checkWallet) {
      return alert("필수정보를 입력하세요.");
    }
    if(!utils.isAddress(checkWallet)){
      return alert("주소형식이 아닙니다.")
    }

    const checkValue = await contract.methods
      .isSaleWhitelist(saleId2,checkWallet,0,0)
      .call();
      setCheckWhiteList2(checkValue.toString());
  }

  const addWhiteListHandler = async()=>{
    if (!saleId3 || !addWhiteList) {
      return alert("필수정보를 입력하세요.");
    }
    const lines = addWhiteList.split("\n").map((v) => v.trim()).filter((val) => val);
    const reg = new RegExp(/0x\w{40} +\d+/)   //0x +40자리 +숫자 
    const invalidLines = lines.filter((v) => !reg.test(v))  // 거짓이면 넣어주고
    if (invalidLines.length > 0) {  //배열에 하나랃도있으면
      return alert(`형식이 잘못됐습니다:\n${invalidLines.join('\n')}`);
    }
    const splitedAddress = lines.map((line) => {  //주소만빼고
      const [address, quota] = line.split(/\s+/);
      return address.trim();
    });
    const splitedQuotas = lines.map((line) => {   //숫자빼고
      const [address, quota] = line.split(/\s+/);
      return quota?.trim();
    });
    const notQuotas = splitedQuotas.filter(v => !v || isNaN(Number(v)));  //숫자 맞는지맞춰보고 스트링말고
    if (notQuotas.length > 0) {
      return alert(`잘못된 갯수가 있습니다:\n${notQuotas.join('\n')}`);
    }
    const notAddreses = splitedAddress.filter(s => !utils.isAddress(s));  //caver로 주소형식이맞나 찾아복
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }
    const addresses = splitedAddress.filter(s => utils.isAddress(s)).map(s=>utils.toChecksumAddress(s));
    const addressChunks = _.chunk(addresses, 100);  //lodash 메소드로 chunk로 배열 100개씩 나눠서 만듬
    const quotaChunks = _.chunk(splitedQuotas, 100);
    let completeCount = 0;

    for (let i = 0; i < addressChunks.length; i++) {  
      const addressChunk = addressChunks[i];
      const quotaChunk = quotaChunks[i];
      const gas = await contract.methods
        .addSaleWhitelist(saleId3,addressChunk,quotaChunk)
        .estimateGas({from:klaytn.selectedAddress});
    
      const lastTx  = await contract.methods
        .addSaleWhitelist(saleId3,addressChunk,quotaChunk)
        .send({from:klaytn.selectedAddress,gas});
        console.log(lastTx);

        completeCount += addressChunk.length;
        console.log(`${completeCount}/${addresses.length}`);
    }
  }

  return (
    <div style={{margin:'30px'}}>
      <h2>등록된 화이트리스트 주소 개수 조회</h2>
      <div>
        판매회차 : <input placeholder="0" type='number' min="0" onChange={(e)=>setSaleId(e.target.value)} /> &nbsp;
        <button onClick={checkWhiteListHandler}> 조회 </button><br/>
        <a>등록된 화이트리스트 : {checkWhiteList}</a>
      </div>
      <h2>화이트리스트 여부 조회</h2>
      판매회차 : <input placeholder="0" type='number'min="0" onChange={(e)=>setsaleId2(e.target.value)} /> <br/>
      지갑주소 : <input placeholder="0x"  onChange={(e)=>setCheckWallet(e.target.value)} /> &nbsp;
      <button onClick={checkWhiteListWalletHandler}> 조회 </button><br/>
      <a>등록된 화이트리스트 : {checkWhiteList2}</a>

      <h2>확정화리 회차1</h2>
      판매회차 : <input placeholder="0" type='number'min="0" onChange={(e)=>setsaleId3(e.target.value)} /> <br/>
      추가할 화이트리스트 주소
      <small class="text-muted">[지갑주소 구매제한개수] 형식. 복수 주소 입력시 줄바꿈.</small><br />
      <textarea  rows="10" cols="50" style={{fontSize:'15px'}} placeholder="0x0000000000000000000000000000000000000000 3&#13;0x0000000000000000000000000000000000000000 1"  onChange={(e)=>setAddWhiteList(e.target.value)} /> &nbsp;
      <br/><button onClick={addWhiteListHandler}> 확정 화이트리스트 추가 </button><br/>
      

      <h2>경쟁화리 회차2</h2>

      <h2>화리 삭제</h2>

      <h2></h2>
    </div>
  );
}
