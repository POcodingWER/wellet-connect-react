import React,{useState,useEffect,useRef} from 'react'
import MyToken from'../abi/MyToken.json'

export default function GetSaleInfo({caverExtKAS,KIP7Adr,minterAdr}) {

const [setAdr, setSetAdr] = useState('')
const [setAdr1, setSetAdr1] = useState('')

const setToken =async ()=>{
  const tokenValue =  caverExtKAS.utils.toPeb(100, 'KLAY')
  const contract = new caverExtKAS.klay.Contract(MyToken.abi,KIP7Adr); 

  const gas =await contract.methods
      .mint(setAdr,tokenValue)     //가스비 계산해서
      .estimateGas({
        from: window.klaytn.selectedAddress,
        });

  const mint = await contract.methods
  .mint(setAdr,tokenValue)
  .send({
    from: window.klaytn.selectedAddress,
    gas
    });
    console.log(mint);
}

const getBalanceOf =async ()=>{
  const contract = new caverExtKAS.klay.Contract(MyToken.abi,KIP7Adr); 
  const balanceOf = await contract.methods
  .balanceOf(setAdr1)
  .call();

  console.log( await caverExtKAS.utils.fromPeb(balanceOf, 'KLAY'));
}

const getAllowance =async ()=>{
  const contract = new caverExtKAS.klay.Contract(MyToken.abi,KIP7Adr); 
  const balanceOf = await contract.methods
  .allowance(setAdr1,minterAdr)
  .call();

  console.log( await caverExtKAS.utils.fromPeb(balanceOf, 'KLAY'));
}


  return (
    <div>
        <div style={{fontSize:'20px'}}>
          <input class="form-control" id="kip7" onChange={(e)=>setSetAdr(e.target.value)} placeholder="0x1234" />
          <button style={{width:'100px',height:'100px'}} onClick={setToken}> 토큰 넣어줌</button> <br/>
          <input class="form-control" id="kip7" onChange={(e)=>setSetAdr1(e.target.value)} placeholder="0x1234" />
          <button style={{width:'100px',height:'100px'}} onClick={getBalanceOf}> 몇개가지고있는지 확인</button>
          <button style={{width:'100px',height:'100px'}} onClick={getBalanceOf}> 승인받았는지</button>
        </div>
    </div>
  )
}
