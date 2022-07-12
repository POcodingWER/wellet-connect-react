import { useState } from 'react'
import OwnableKIP17 from './abi/OwnableKIP17.json'
import _ from 'lodash';
// import Caver from "caver-js";
// import Web3 from "web3";
//메타마스크 어디연결인지 확인

function Hhii() {
  const [ContractAddress, setContractAddress] = useState('0x80BE2Fd762cE9DBC36d87e6ead5b1C3f5F0B5c44')
  const [netWork, setNetWork] = useState('')
  const [walletadr, setWalletadr] = useState('')



  const connectklaytnWellet = async() =>{
    console.log('지갑연결되어있나 연결true, 연결x false:' , klaytn._kaikas.isEnabled());
    const klaytnConnectSuccess = await klaytn.enable(); //또는 window.klaytn.enable()
    if(klaytnConnectSuccess){   //연결되면
      console.log('현제 지갑주소 :', klaytnConnectSuccess);
      console.log('네트워크 넘버 : 1001이면 baobob 8217이면메인넷 :', klaytn.networkVersion);
      setNetWork(klaytn.networkVersion)
      console.log('선택한 지갑주소:', klaytn.selectedAddress);
      setWalletadr(klaytn.selectedAddress)
    }
  }

  const KIP17Deploy = async () =>{
    const contract = new window.caver.klay.Contract(OwnableKIP17.abi);
    const deployer = contract.deploy({
      data: OwnableKIP17.bytecode,
      arguments: ['t샷샤샷ㅅ','시임보오오올'],
    });
    console.log( deployer)

    const gas = await deployer.estimateGas(); //가스계산 추출
    console.log(gas)
    const deployed = await deployer.send({  
      from: klaytn.selectedAddress,
      gas: gas,
      value:0
    });
    console.log("KIP17 contract adr : deployed.options.address");
    setContractAddress(deployed.options.address)
  };

  const KIP17contact = async () =>{
    if (!ContractAddress)return;
    const contract = new window.caver.klay.Contract(OwnableKIP17.abi,ContractAddress);
    
    /*call */
    // const callname = await contract.methods
    // .name()
    // .call({from: klaytn.selectedAddress })
    
    // const callSymbol= await contract.methods
    // .symbol()
    // .call({from: klaytn.selectedAddress })
    // console.log('name :',callname,'symbol',callSymbol)

    /*Send 1방식 */
    const mintgas =await contract.methods   //가스비 계산해서
    .mintWithTokenURI(klaytn.selectedAddress,10,'coca')
    .estimateGas({from: klaytn.selectedAddress});
    console.log(mintgas);

    // const mint1 = await contract.methods
    //   .mintWithTokenURI(klaytn.selectedAddress,10,'coca')
    //   .send({
    //     from:klaytn.selectedAddress,
    //     gas:mintgas
    //   })

    /*Send encodeFunctionCall 사용방식 */
    // const mintgas =await contract.methods   //가스비 계산해서
    // .mintWithTokenURI(klaytn.selectedAddress,10,'coca')
    // .estimateGas({from: klaytn.selectedAddress});

    // const name =  contract.options.jsonInterface[27] //method이름다보임
    // console.log(name);

    // const abiEncod = window.caver.klay.abi.encodeFunctionCall(name,[klaytn.selectedAddress,10,'coca']) //데이터코드화
    // console.log(abiEncod);
    
    // const mint2 = await window.caver.klay.sendTransaction({
    //   type:"SMART_CONTRACT_EXECUTION",
    //   from:klaytn.selectedAddress,
    //   to:ContractAddress,
    //   gas:mintgas,
    //   data:abiEncod
    // })
    console.log(mint2)
  };

  const addr = [1,2,3,4,5,6,7,7,8,9,8,7,7,6,6,5,4,4,3,3,2,2,4,7,7,5,4,5,5,6,6,4,8,9,9,9,5,5,5,4,4,5]
  const addressChunks = _.chunk(addr, 5)
  const test = async () =>{
    // const caver = new Web3(window.caver.klay)
    for (let i = 0; i < addressChunks.length; i++) {
      const addressChunk = addressChunks[i];
      console.log(addressChunk)
  }

  }


  return (
    <div className="App">
      <header className="App-header">
        <p>지갑 연결 </p> {netWork? `네트웤 ${netWork}, 지갑주소 : ${walletadr}`: <button onClick={connectklaytnWellet}> kaikas지갑연결</button>} 
        {/* <button onClick={connectEthWellet}> metamask지갑연결</button>
        <br />
        <br /> */}
        
        <br />
        <br />
        <button onClick={KIP17Deploy}> KIP17 Deploy</button>
        <button onClick={KIP17Deploy}> WhiteList Deploy</button>
        <button onClick={KIP17Deploy}> Minter Deploy</button>
        {ContractAddress
        ?   
        <div>
          <p>
           KIP17 adr : {ContractAddress}
          </p>
          <button onClick={KIP17contact}> KIP17 contact </button>
        </div>
         :
        <div>
          <p>
            KIP17 adr :
          </p>
          <button disabled onClick={KIP17contact}> KIP17 contact </button>
        </div>}
        <br />
        <br />
        <button onClick={test}> test </button> 
        {ContractAddress?` KIP17 adr : ${ContractAddress}` :`KIP17 adr : `}
      </header>
    </div>
  )
}

export default Hhii
