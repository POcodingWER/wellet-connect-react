import React,{useState,useEffect} from "react";
import { Route, Router, Routes, Link } from "react-router-dom";
import Index from './component/Index';
import KIP17 from './component/KIP17';
import Minter from "./component/Minter";

import WhiteList from './component/WhiteListdAdd';
import Hhii from './Hhii';

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
const getUserData= await get(klaytn.networkVersion, klaytn.selectedAddress)

function App() {
  const [netWork, setNetWork] = useState('');
  const [walletadr, setWalletadr] = useState('');
  const [KIP17adr,setKIP17adr] = useState('');
  const [WhiteListadr,setWhiteListadr] = useState('');
  const [mintadr,setMintadr] = useState('');
  
  useEffect(() => {
    if( klaytn._kaikas.isEnabled()){
      setNetWork(klaytn.networkVersion)
      setWalletadr(klaytn.selectedAddress)
      if(!getUserData)return;
      setKIP17adr(getUserData.KIP17)
      setWhiteListadr(getUserData.Whitelist)
      setMintadr(getUserData.Minter)
    }
  },[])
  


  const connectklaytnWellet = async() =>{
    console.log('지갑연결되어있나 연결true, 연결x false:' , klaytn._kaikas.isEnabled());
    const klaytnConnectSuccess = await klaytn.enable(); //또는 window.klaytn.enable()
    if(klaytnConnectSuccess){   //연결되면
      console.log('현제 지갑주소 :', klaytnConnectSuccess);
      console.log('네트워크 넘버 : 1001이면 baobob 8217이면메인넷 :', klaytn.networkVersion);
      setNetWork(klaytn.networkVersion)
      console.log('선택한 지갑주소:', klaytn.selectedAddress);
      setWalletadr(klaytn.selectedAddress)
      location.reload();
    }
  }
 
  return (
    <div style={{marginTop:'40px'}}>
       <b>지갑 연결</b> {walletadr? `네트웤 ${netWork}, 지갑주소 : ${walletadr}`: <button onClick={connectklaytnWellet}> kaikas지갑연결</button>} 
        <br/>
        <br/>
         <Routes>
          <Route path="/" element={<Index KIP17adr={KIP17adr} WhiteListadr={WhiteListadr} setWhiteListadr={setWhiteListadr} minteadr={mintadr} />} />
          <Route path="/KIP17" element={<KIP17/>} />
          <Route path="/Minter" element={<Minter KIP17adr={KIP17adr} WhiteListadr={WhiteListadr} />} />
          <Route path="/WhiteListAdd" element={<WhiteList />} />
          {/* <Route path="/222" element={<Hhii />} /> */}
        </Routes>
    </div>
  );
}

export default App
