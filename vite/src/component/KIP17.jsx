import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom'
import OwnableKIP17 from'../abi/OwnableKIP17.json'


export default function KIP17() {
  let navigate = useNavigate();
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  
  
  const KIP17Deploy = async () =>{
    const contract = new window.caver.klay.Contract(OwnableKIP17.abi);
    const deployer = contract.deploy({
      data: OwnableKIP17.bytecode,
      arguments: [name,symbol],
    });

    const gas = await deployer.estimateGas(); //가스계산 추출
    console.log(gas)
    const deployed = await deployer.send({  
      from: klaytn.selectedAddress,
      gas: gas,
      value:0
    });
    console.log("KIP17 contract adr :", deployed.options.address);
    navigate("/")
  };

  const nameChange = (e)=>{
   setName(e.target.value)
  }
  const SYMBOLChange = (e)=>{
    setSymbol(e.target.value);
  }
  
  return (
    <div>
      <p>
        NAME : <input placeholder="ex) Belly Gom" value={name} onChange={nameChange}/>
      </p>
      <p>
        SYMBOL : <input placeholder="보통6자 대문자" value={symbol} onChange={SYMBOLChange}/>
      </p>
      <button onClick={KIP17Deploy}>Deplopy</button>
    </div>
  );
}
