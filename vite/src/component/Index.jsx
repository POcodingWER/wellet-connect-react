import React,{useState} from "react";
import { Link } from "react-router-dom";
import Whitelist from'../abi/Whitelist.json'

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
export default function Index({KIP17adr,WhiteListadr,setWhiteListadr,minteadr}) {
  const WLdeploy = async () =>{
    const contract = new window.caver.klay.Contract(Whitelist.abi);
    const deployer = contract.deploy({
      data: Whitelist.bytecode,
      arguments: [],
    });
    const gas = await deployer.estimateGas(); //가스계산 추출
    const deployed = await deployer.send({  
      from: klaytn.selectedAddress,
      gas: gas,
      value:0
    });
    console.log("WhiteList contract adr :", deployed.options.address);
    setWhiteListadr(deployed.options.address);

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
        ['Whitelist']: deployed.options.address
      })
    });
    let resJson = await res.json()
    console.log(resJson);
  };

  return (
    <div>
      <p>
        {KIP17adr
          ? 
          <div>
            <button disabled> KIP17deploy</button> {KIP17adr}
          </div> 
          :  
          <Link to="/KIP17"> <button > KIP17deploy</button></Link>
        }
      </p>
      <p>
        {WhiteListadr
          ? 
          <div>
            <button disabled> WhiteList Deploy</button> {WhiteListadr}
          </div> 
          :  
           <button onClick={WLdeploy}> WhiteList Deploy</button>
        }
      </p>
      <p>
        {minteadr
          ? 
          <div>
            <button disabled> Minter Deploy</button> {minteadr}
          </div> 
          :  
          <Link to="/Minter"> <button > Minter Deploy</button></Link>
        }
      </p>
      
    </div>
  );
}
