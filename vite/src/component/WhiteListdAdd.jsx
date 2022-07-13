import React,{useState,useEffect} from 'react'
import Whitelist from'../abi/Whitelist.json'
import kIP17 from'../abi/OwnableKIP17.json'
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
  
  const [saleId4, setsaleId4] = useState("");
  const [addWhiteList2, setAddWhiteList2] = useState("");
  
  const [deletSleId, setDeletSleId] = useState("");
  const [deleteAddWhiteList, setDleeteAddWhiteList] = useState("");
  
  const [saleId5, setsaleId5] = useState("");
  const [addContractList, setAddContractList] = useState("");

  const [registNFT,setRegist] =useState([]);
  
  useEffect(() => {
    let showNftInfoData=[];
    const callNftAddressesBySaleId = async() =>{
      const maxSaleId = 2;
      const maxNftCount = 10;
      for (let saleId = 1; saleId <= maxSaleId; saleId++) {
        const tempArr = [];
  
        for (let nftIndex = 0; nftIndex < maxNftCount; nftIndex++) {
          let nftAddressesBySaleId = "0x";
          let nftMinimumBalanceBySaleId = 0;
          try {
            nftAddressesBySaleId = await contract.methods
            .nftAddressesBySaleId(saleId, nftIndex)
            .call({from:klaytn.selectedAddress});
            
            nftMinimumBalanceBySaleId = await contract.methods
            .nftMinimumBalanceBySaleId(saleId, nftIndex)
            .call({ from: klaytn.selectedAddress });
          } catch (e) {
            break;
            // console.log(e);
          }
          const nftName = await getNftName(nftAddressesBySaleId); //이름찾아오는 함수
          
          tempArr.push({
            saleId: saleId,
            nftAddress: nftAddressesBySaleId,
            nftName: nftName,
            nftMinimumBalance: nftMinimumBalanceBySaleId,
          });
        }
  
        showNftInfoData.push(tempArr);
        console.log(showNftInfoData)
        setRegist(showNftInfoData);
      }
    }
    callNftAddressesBySaleId()
  }, [])
  

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
    let lastTx;
    for (let i = 0; i < addressChunks.length; i++) {  
      const addressChunk = addressChunks[i];
      const quotaChunk = quotaChunks[i];
      const gas = await contract.methods
        .addSaleWhitelist(saleId3,addressChunk,quotaChunk)
        .estimateGas({from:klaytn.selectedAddress});
    
      lastTx  = await contract.methods
        .addSaleWhitelist(saleId3,addressChunk,quotaChunk)
        .send({from:klaytn.selectedAddress,gas});
        console.log(lastTx);

        completeCount += addressChunk.length;
        console.log(`${completeCount}/${addresses.length}`);
    }
    if (lastTx.status) {
      alert("성공");
      window.location.reload();
    } else {
      alert("실패");
    }
  }

  const addWhiteListHandler2 = async()=>{
    if (!saleId4 || !addWhiteList2) {
      return alert("필수정보를 입력하세요.");
    }
    const splitedAddress = addWhiteList2.split("\n").map((v) => v.trim()).filter((val) => val);
    const notAddreses = splitedAddress.filter(s => !utils.isAddress(s));  //caver로 주소형식이맞나 찾아복
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }
    const addresses = splitedAddress.filter(s => utils.isAddress(s)).map(s=>utils.toChecksumAddress(s));
    const addressChunks = _.chunk(addresses, 100);  //lodash 메소드로 chunk로 배열 100개씩 나눠서 만듬
    let completeCount = 0;
    let lastTx;
    for (let i = 0; i < addressChunks.length; i++) {  
      const addressChunk = addressChunks[i];
      const gas = await contract.methods
        .addSaleWhitelist(saleId4,addressChunk,[])
        .estimateGas({from:klaytn.selectedAddress});
      lastTx  = await contract.methods
        .addSaleWhitelist(saleId4,addressChunk,[])
        .send({from:klaytn.selectedAddress,gas});
        console.log(lastTx);
        completeCount += addressChunk.length;
        console.log(`${completeCount}/${addresses.length}`);
    }
    if (lastTx.status) {
      alert("성공");
      window.location.reload();
    } else {
      alert("실패");
    }
  }

  const deletWhiteListHandler = async()=>{
    if (!deletSleId || !deleteAddWhiteList) {
      return alert("필수정보를 입력하세요.");
    }
    const splitedAddress = deleteAddWhiteList.split("\n").map((v) => v.trim()).filter((val) => val);
    const notAddreses = splitedAddress.filter(s => !utils.isAddress(s));  //caver로 주소형식이맞나 찾아복
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }
    const addresses = splitedAddress.filter(s => utils.isAddress(s)).map(s=>utils.toChecksumAddress(s));
    const addressChunks = _.chunk(addresses, 100);  //lodash 메소드로 chunk로 배열 100개씩 나눠서 만듬
    let completeCount = 0;
    let lastTx;

    for (let i = 0; i < addressChunks.length; i++) {  
      const addressChunk = addressChunks[i];
      const gas = await contract.methods
        .removeSaleWhitelist(deletSleId,addressChunk)
        .estimateGas({from:klaytn.selectedAddress});
      lastTx  = await contract.methods
        .removeSaleWhitelist(deletSleId,addressChunk)
        .send({from:klaytn.selectedAddress,gas});
        
        console.log(lastTx);
        completeCount += addressChunk.length;
        console.log(`${completeCount}/${addresses.length}`);
    }
    if (lastTx.status) {
      alert("성공");
      window.location.reload();
    } else {
      alert("실패");
    }
  }

  const getNftName = async (address) => {
    const nftContract = await new window.caver.klay.Contract(kIP17.abi,address)
    return nftContract.methods.name().call();
  }

  const addContractListHandler = async()=>{
    if (!saleId5 || !addContractList||false) {
      return alert("필수정보를 입력하세요.");
    }
    const lines = addContractList.split("\n").map((v) => v.trim()).filter((val) => val);
    const reg = new RegExp(/0x\w{40} +\d+/)   //0x +40자리 +숫자 
    const invalidLines = lines.filter((v) => !reg.test(v))  // 거짓이면 넣어주고
    if (invalidLines.length > 0) {  //배열에 하나랃도있으면
      return alert(`형식이 잘못됐습니다:\n${invalidLines.join('\n')}`);
    }
    const splitedAddress = lines.map((line) => {  //주소만빼고
      const [address, quota] = line.split(/\s+/);
      return address.trim();
    });
    const splitedBalances = lines.map((line) => {   //숫자빼고
      const [address, quota] = line.split(/\s+/);
      return quota?.trim();
    });
    const notQuotas = splitedBalances.filter(v => !v || isNaN(Number(v)));  //숫자 맞는지맞춰보고 스트링말고
    if (notQuotas.length > 0) {
      return alert(`잘못된 갯수가 있습니다:\n${notQuotas.join('\n')}`);
    }
    const notAddreses = splitedAddress.filter(s => !utils.isAddress(s));  //caver로 주소형식이맞나 찾아복
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }

    const nftInfoAsString = await Promise.all(splitedAddress.map(async (address, index) => {
      let nftName = '';
      try {
        nftName = await getNftName(address);
      } catch (e) { 
        return;
      }
      return `address: ${address}\nname: ${nftName ? nftName : '???'}\nbalance: ${splitedBalances[index]}`;
    }));

    if (!window.confirm(`확인\n${nftInfoAsString.join('\n\n\n')}`)) return;
      const gas = await contract.methods
        .setNftInfo(saleId5,splitedAddress,splitedBalances)
        .estimateGas({from: klaytn.selectedAddress});

      const tx  = await contract.methods
      .setNftInfo(saleId5,splitedAddress,splitedBalances)
      .send({from:klaytn.selectedAddress,gas});

    if (tx.status) {
      alert("성공");
      window.location.reload();
    } else {
      alert("실패");
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
      <textarea  rows="2" cols="50" style={{fontSize:'15px'}} placeholder="0x0000000000000000000000000000000000000000 3&#13;0x0000000000000000000000000000000000000000 1"  onChange={(e)=>setAddWhiteList(e.target.value)} /> &nbsp;
      <br/><button onClick={addWhiteListHandler}> 확정 화이트리스트 추가 </button><br/>

      <h2>경쟁화리 회차2</h2>
      판매회차 : <input placeholder="0" type='number'min="0" onChange={(e)=>setsaleId4(e.target.value)} /> <br/>
      추가할 화이트리스트 주소
      <small class="text-muted">[지갑주소 구매제한개수] 형식. 복수 주소 입력시 줄바꿈.</small><br />
      <textarea  rows="2" cols="50" style={{fontSize:'15px'}} placeholder="0x0000000000000000000000000000000000000000&#13;0x0000000000000000000000000000000000000000"  onChange={(e)=>setAddWhiteList2(e.target.value)} /> &nbsp;
      <br/><button onClick={addWhiteListHandler2}> 경쟁 화이트리스트 추가 </button><br/>
      

      <h2>화리 삭제</h2>
      판매회차 : <input placeholder="0" type='number'min="0" onChange={(e)=>setDeletSleId(e.target.value)} /> <br/>
      추가할 화이트리스트 주소
      <small class="text-muted">[지갑주소 구매제한개수] 형식. 복수 주소 입력시 줄바꿈.</small><br />
      <textarea  rows="2" cols="50" style={{fontSize:'15px'}} placeholder="0x0000000000000000000000000000000000000000&#13;0x0000000000000000000000000000000000000000"  onChange={(e)=>setDleeteAddWhiteList(e.target.value)} /> &nbsp;
      <br/><button onClick={deletWhiteListHandler}> 경쟁 화이트리스트 추가 </button><br/>

      <h2>연계 홀더 추가(컨트랙트 주소)</h2>
      판매회차 : <input placeholder="0" type='number'min="0" onChange={(e)=>setsaleId5(e.target.value)} /> <br/>
      추가할 컨트랙트 주소
      <small class="text-muted">[홀더 구매제한개수] 형식. 복수 주소 입력시 줄바꿈.</small><br />
      <textarea  rows="2" cols="50" style={{fontSize:'15px'}} placeholder="0x0000000000000000000000000000000000000000 3&#13;0x0000000000000000000000000000000000000000 1"  onChange={(e)=>setAddContractList(e.target.value)} /> &nbsp;
      <br/><button onClick={addContractListHandler}> 확정 화이트리스트 추가 </button><br/>
      
      <h3>white List에 추가된 contract address</h3>
      <table border="1">
                <tr>
                    <th>판매회차</th>
                    <th>NFT 컨트랙트</th>
                    <th>이름</th>
                    <th>최소 보유수량</th>
                </tr>
                {registNFT[1]? 
                <>
                  {registNFT[0].map((a)=>{
                    return(
                    <tr>
                        <td>{a.saleId}</td>
                        <td>{a.nftAddress}</td>
                        <td>{a.nftName}</td>
                        <td>{a.nftMinimumBalance}</td>
                    </tr>
                    )})}
                  {registNFT[1].map((a)=>{
                    return(
                    <tr>
                        <td>{a.saleId}</td>
                        <td>{a.nftAddress}</td>
                        <td>{a.nftName}</td>
                        <td>{a.nftMinimumBalance}</td>
                    </tr>
                    )})}
                </>
                :''}
             
            </table>


      
    </div>


  );
}
