import { useState } from 'react'
import OwnableKIP17 from '../../hardhat/artifacts/contracts/SunmiyaNFT.sol/SunmiyaNFT.json'
// import Caver from "caver-js";
// import Web3 from "web3";
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
  const [ContractAddress, setContractAddress] = useState('0x34a9442AaaE417511D022F04466d34e72976158e')
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
  const deploy = async () =>{
    const contract = new window.caver.klay.Contract(OwnableKIP17.abi);
    const deployer = contract.deploy({
      data: OwnableKIP17.bytecode,
      // arguments: ['name','symbol'],
      arguments: [...args],
    });
    const gas = await deployer.estimateGas(); //가스계산 추출
    const deployed = await deployer.send({  
      from: klaytn.selectedAddress,
      gas: gas,
      value: 0,
    });

    setContractAddress(deployed.options.address)
  };
   
  const test = async () =>{
    // const caver = new Web3(window.caver.klay)
   console.log('caver')

  }
  return (
    <div className="App">
      <header className="App-header">
        <p>지갑 연결</p>
        <button onClick={connectEthWellet}> metamask지갑연결</button>
        <br />
        <br />
        <button onClick={connectklaytnWellet}> kaikas지갑연결</button>
        <br />
        <br />
        <button onClick={deploy}> deploy</button>{ContractAddress}
        <br />
        <br />
        <button onClick={test}> test </button>{ContractAddress}
      </header>
    </div>
  )
}

export default App
