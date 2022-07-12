import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom'
import MinterKIP17 from'../abi/MinterKIP17.json'

const BASE_URI = 'https://qxaz7p4d44.execute-api.ap-northeast-2.amazonaws.com/Prod/';
const createId = (network, owner) => `${owner}-${network}`;

async function get(network, owner) {
  const res = await fetch(`${BASE_URI}${createId(network, owner)}`);
  try {
    const info = await res.json();
    return info;
  } catch(e) {
    return null;
  }
}

let network =  klaytn.networkVersion;
let owner =  klaytn.selectedAddress;

export default function Minter( {KIP17adr,WhiteListadr}) {
  let navigate = useNavigate();
  const [adr, setAdr] = useState('')
  const [URL, setURL] = useState('')

  const MinterDeploy = async () =>{
    const contract = new window.caver.klay.Contract(MinterKIP17.abi);
    const deployer = contract.deploy({
      data: MinterKIP17.bytecode,
      arguments: [adr,KIP17adr,WhiteListadr,URL],
    });

    const gas = await deployer.estimateGas(); //가스계산 추출
    console.log(gas)
    const deployed = await deployer.send({  
      from: klaytn.selectedAddress,
      gas: gas,
      value:0
    });

    const data = await get(network, owner) || {};
    const res = await fetch(BASE_URI, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        id: createId(network, owner),
        ['Minter']: deployed.options.address
      })
    });
    let resJson = await res.json()
    console.log(resJson);

    console.log("Minter contract adr :", deployed.options.address);
    navigate("/")
  };

  const adrChange = (e)=>{
   setAdr(e.target.value)
  }
  const URLChange = (e)=>{
    setURL(e.target.value);
  }
  



  return (
    <div>
      <p>                                        
        대납받을 Address : <input style={{width:'500px'}} placeholder="0x000000000000000000000000000000000000000" vlaue={adr} onChange={adrChange}/>
      </p>
      <p>
        KIP17 Address : <input disabled style={{width:'500px'}}  value={KIP17adr} />
      </p>
      <p>
        WhiteLList Address : <input disabled style={{width:'500px'}}  value={WhiteListadr} />
      </p>
      <p>
        META Data URL : <input style={{width:'500px'}} placeholder="metadata URL" value={URL} onChange={URLChange}/>
      </p>
      <button onClick={MinterDeploy}>Deploy</button>
    </div>
  )
}
