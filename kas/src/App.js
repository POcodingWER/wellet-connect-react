import logo from './logo.svg';
import './App.css';
import CaverExtKAS from'caver-js-ext-kas'
import Caver from'caver-js'


import ConnectWallet from './component/ConnectWallet';
import GetSaleInfo from './component/GetSaleInfo';

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
  
  

  return (
    <div className="App">
      <header className="App-header">
        <ConnectWallet caverExtKAS={caverExtKAS} caver={caver} />
        <GetSaleInfo caverExtKAS={caverExtKAS}/>
      </header>
    </div>
  );
}

export default App;