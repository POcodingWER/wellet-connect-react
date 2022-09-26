const fs = require('fs');
const Caver = require('caver-js');
const KIP17 = require('../src/abi/OwnableKIP17.json');
let caverExtKAS = new Caver('https://public-node-api.klaytnapi.com/v1/cypress');
const axios = require('axios');

const 뽑기 = async () => {
    const contract = new caverExtKAS.klay.Contract(KIP17.abi, '0xce70eef5adac126c37c8bc0c1228d48b70066d03');
    
    const balance = await contract.methods.balanceOf('0x1e53b6f2dfbe3df1057b74662d02b504be8e7494').call();
    console.log("총발행 토큰", balance);
    const timer = ms => new Promise(res => setTimeout(res, ms))
    let nftBox =[]
    
    for (let i = 0; i < 3; i++) {
      const nftNum = await contract.methods.tokenOfOwnerByIndex('0x1e53b6f2dfbe3df1057b74662d02b504be8e7494',i).call();
      const metadata = `https://belly.bellygom.world/${nftNum}.json`
      await timer(500);   //딜레이주는거임 너무빨리요청하면 caver에서 error처리함
      await axios(metadata).then((res)=>{nftBox.push({number:res.data.name,grade:res.data.attributes[7].value})})
    }

    fs.writeFileSync("test.json", JSON.stringify(nftBox));
    // console.log(nftBox.length,nftBox);
    // let countNFT = await contract.methods
    //   .setApprovalForAll('0xFef3e0f9B76C2fcA3dC17d50CCD2372EA83d0f3D',1)
    //   .send( {from: window.klaytn.selectedAddress,gas:100000});
    //   console.log('보유개수',countNFT);
  };
  뽑기();