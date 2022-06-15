import { useState } from 'react'

//메타마스크 어디연결인지 확인
const chainIdToNetworkName = (chainId) => {
    let network;
    switch (parseInt(chainId, 16)) {
      case 1:
        network = "Mainnet";
        break;
      case 3:
        network = "Ropsten";
        break;
      case 4:
        network = "Rinkeby";
        break;
      case 5:
        network = "Goerli";
        break;
      case 6:
        network = "Kovan";
        break;
      case 1337:
        network = "Localhost";
        break;
      case 31337:
        network = "Hardhat";
        break;
      default:
        network = "Unknown";
        break;
    }
    return network;
  };

function App() {

  const connectEthWellet = async () => {

    const metamask =  window.ethereum;
    if (metamask) {
      const accounts = await metamask.request({
        // method: "eth_accounts",   //주소만불러오는 메소드
        method: "eth_requestAccounts"    //주소불러와주고 연결안되있으면 연결시켜주는 메소드
      });
      const network = await metamask.request({
        method: "eth_chainId",
      });
      const balance = await metamask.request({
        method: "eth_getBalance",
        params: [
          accounts[0],
          'latest'
        ],
      });

      console.log(accounts)
      console.log('connect network : ', chainIdToNetworkName(network) )
      console.log( 'balance Of : ', parseInt(balance, 16) )
    }
  }

  const connectklaytnWellet = async() =>{
    
    console.log('지갑연결되어있나 연결true, 연결x false:' , klaytn._kaikas.isEnabled());
    const klaytnConnectSuccess = await klaytn.enable(); //또는 window.klaytn.enable()
    
    if(klaytnConnectSuccess){   //연결되면
      
      console.log('현제 지갑주소 :', klaytnConnectSuccess);
      console.log('네트워크 넘버 : 1001이면 baobob 8217이면메인넷 :', klaytn.networkVersion);
      console.log('선택한 지갑주소:', klaytn.selectedAddress);
    }
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <p>지갑 연결</p>
        <button onClick={connectEthWellet}> 이거눌러서 metamask지갑연결</button>
        <br />
        <br />
        <button onClick={connectklaytnWellet}> 이거눌러서 kaikas지갑연결</button>
      </header>
    </div>
  )
}

export default App
