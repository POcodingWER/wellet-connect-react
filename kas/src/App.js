import logo from './logo.svg';
import './App.css';
import CaverExtKAS from'caver-js-ext-kas'
import Caver from'caver-js'
import MinterKIP17 from'./abi/MinterKIP17.json'
import KIP17 from'./abi/OwnableKIP17.json'

const accessKeyId = "KASKZJ1FZ3750DK7VAF18NOU";
const secretAccessKey = "ZWd5zCMEpjRJLt-EUKSuBJy3jaFywFaYkgK6DFs4";
const chainId = 1001 // for Baobab; 8217 if Cypress
const caverExtKAS = new CaverExtKAS(chainId, accessKeyId, secretAccessKey);
// const caverExtKAS = new CaverExtKAS(window.klaytn);
const caver = new Caver(window.klaytn);


function App() {

  window.klaytn.on('accountsChanged',function(accounts){    //change 함수
    console.log(accounts)
    getlog()
  })

  const connectklaytnWellet = async() =>{
    console.log('지갑연결되어있나 연결true, 연결x false:' , window.klaytn._kaikas.isEnabled());
    const klaytnConnectSuccess = await window.klaytn.enable(); 
    if(klaytnConnectSuccess){   //연결되면
      console.log('현제 지갑주소 :', klaytnConnectSuccess);
      console.log('네트워크 넘버 : 1001이면 baobob 8217이면메인넷 :', window.klaytn.networkVersion);
      console.log('선택한 지갑주소:', window.klaytn.selectedAddress);
    }
  }
  connectklaytnWellet()
  
  const click = async() =>{
    console.log(caverExtKAS); //kas 연결확인
    console.log('현재블록번호 : ' , await caverExtKAS.klay.getBlockNumber()); //kas 연결확인

    /*어드민 넣어주면 kas로도 호추가능*/
    // const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,'0x5c46127E8934dcF8ff04A07eb6005fe65b27A4F1');
    // const address = await contract.methods.getAddress().call()  //리버트이유는 어드민이아니라서
    // const address = await contract.methods.getAddress().call({from:'0xee2b1388f5513e8e220737c9a850dd5c11133cda'});  
    // console.log(address);
    
    // /*어드민 넣어주면 kas로도 호추가능*/
    // const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,'0x5c46127E8934dcF8ff04A07eb6005fe65b27A4F1');
    // console.log(contract);
    // const isOpen = await contract.methods.isOpen().call({from:'0xee2b1388f5513e8e220737c9a850dd5c11133cda'});  
    // console.log(isOpen);
    // const x = await contract.methods.isOpen().call({from:'0xee2b1388f5513e8e220737c9a850dd5c11133cda'});  
    // console.log(x);
  }
  
  /*admin 아닌사람이 카스 사용해서 어드민 주소 넣어서 민팅하면 되는지?kas는 안됨
    디코에서한 유효성검사처럼 send하면서 걸림 */
  const kip17mint = async ()=>{
    const contract = new caverExtKAS.klay.Contract(KIP17.abi,'0xAF1f7E3bfd45f8B269fe3f4C9Ec0dEDc0C9e6890');
    console.log("contractaddress :",contract._address);
    const owner = await contract.methods.owner().call()
    console.log("owner :",owner);

    const mintgas =await contract.methods   //가스비 계산해서
    .mintWithTokenURI('0x7ee3014e72de510406be9cbff9ce602504af8f54',35,'coca')
    .estimateGas({from: owner});
    console.log(mintgas);
    /*그냥 샌드 */
    const mint1 = await contract.methods
      .mintWithTokenURI('0x7ee3014e72de510406be9cbff9ce602504af8f54',35,'coca')
      .send({
        from:owner,
        gas:mintgas
      })
    console.log(mint1);
    
    /*byte코드로 encode후 send */
    // const name =  contract.options.jsonInterface.filter(
    //   ({ name }) => name === "mintWithTokenURI"
    // )[0];; 
    // console.log(name);
   
    // const abiEncod = caverExtKAS.klay.abi.encodeFunctionCall(name,['0x7ee3014e72de510406be9cbff9ce602504af8f54',32,'coca']) //데이터코드화
    // console.log(abiEncod);

    // const mint2 = await caverExtKAS.klay.sendTransaction({
    //   type:"SMART_CONTRACT_EXECUTION",
    //   from:owner,  //admin adr
    //   to:contract._address,   //contract adr
    //   gas:mintgas,
    //   data:abiEncod
    // })
    // console.log(mint2)
  }

  const mintcheck = async ()=>{

    // 1방법1  caver로 전송
    // const contract = new caver.klay.Contract(MinterKIP17.abi,'0x1d5476A2FaA7b304b06e06Eeafe2b4d2b80ac8DC');
    // console.log(contract._address); //kas 연결확인
    // const isOpen = await contract.methods.getSaleInfo(1).call();
    // console.log(isOpen); //kas 연결확인
    // console.log(window.klaytn.selectedAddress); //kas 연결확인

    // const gas =await contract.methods   //가스비 계산해서
    // .publicSale(1,1)
    // .estimateGas({from: window.klaytn.selectedAddress,
    //   value:"1000000000000000000",});
    // console.log(gas);

    // const sale = await contract.methods.publicSale(1,1).send(
    //   {from:window.klaytn.selectedAddress,
    //     value:"1000000000000000000",
    //     gas
    // });
    // console.log(sale);

    // 방법2 kas로 데이터 endcoding 하고 caver로 전송
    const contract = new caverExtKAS.klay.Contract(MinterKIP17.abi,'0xad078452065D6Cc3b94B53CCee1066368D6612f6');
    console.log(contract._address); //kas 연결확인

    // const isOpen = await contract.methods.getSaleInfo(1).call();
    const isOpen = await contract.methods.isOpen().call();
    console.log(isOpen); //kas 연결확인

    const gas =await contract.methods   //가스비 계산해서
    .publicSale(1,1)
    .estimateGas({
      from: window.klaytn.selectedAddress,
      value:"1000000000000000000",});
    console.log(gas);

    const name =  contract.options.jsonInterface.filter(
      ({ name }) => name === "publicSale"
    )[0];; 

     //데이터코드화 2가지방법
    const abiEncod = caver.klay.abi.encodeFunctionCall(name,[1,1], {value:"1000000000000000000"} )
    const encode = contract.methods.publicSale(1,1).encodeABI()
    
    const mint2 = await caver.klay.sendTransaction({
        type:"SMART_CONTRACT_EXECUTION",
        from:window.klaytn.selectedAddress,  //admin adr
        to:contract._address,   //contract adr
        gas,
        data:encode,
        value:"1000000000000000000"
      })
      console.log(mint2)

  }
  
  const getlog = async ()=>{
    const contract = new caverExtKAS.klay.Contract(KIP17.abi,'0x5544775e57aa4C4D83c606971C03Da06324CC451');
    //returnValues 안에있는 값을 필터로 찾으면 됩니당.
    const getBlockEvent = await contract.getPastEvents('Transfer',{ filter:{to:[window.klaytn.selectedAddress]}, fromBlock: 96534898, toBlock:'latest'})
    console.log(getBlockEvent); 
  }


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo}  className="App-logo" alt="logo" />
        <button style={{width:'100px',height:'100px'}} onClick={getlog}> click me</button>
      </header>
    </div>
  );
}

export default App;