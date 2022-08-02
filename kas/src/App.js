import React from 'react'
import './App.css';
import CaverExtKAS from'caver-js-ext-kas'
import Caver from'caver-js'
import { Route, Router, Routes, Link } from "react-router-dom";

import ConnectWallet from './component/ConnectWallet';
import GetSaleInfo from './component/GetSaleInfo';
import Test from './Test';

const accessKeyId = "";
const secretAccessKey = "";
const chainId = window.klaytn.networkVersion // for Baobab; 8217 if Cypress
const caver = new Caver(window.klaytn);
let caverExtKAS

if(accessKeyId===""||secretAccessKey===""){   //kasAPI
   caverExtKAS = new Caver(window.klaytn);
  }else{
    caverExtKAS = new CaverExtKAS(chainId, accessKeyId, secretAccessKey);
}


function App() {
  const KIP7Adr = '0x37E9101A9c1C23C1F7fAC16817085317b01F99f1';    //KIP7 Adr
  const minterAdr = '0x5F995E9f03007B623a637f7cE2De4764606ec756'; //minter adr
  

  return (
    <div className="App">
      <header className="App-header">
        {/* <ConnectWallet caverExtKAS={caverExtKAS} caver={caver} /> */}
        {/* <GetSaleInfo caverExtKAS={caverExtKAS}/> */}
        <Test KIP7Adr={KIP7Adr} minterAdr={minterAdr}/>
        <Routes>
          <Route path="/admin" element={<GetSaleInfo caverExtKAS={caverExtKAS} KIP7Adr={KIP7Adr} minterAdr={minterAdr} />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;