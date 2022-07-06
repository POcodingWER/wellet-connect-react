const express = require("express");
const bodyParser = require("body-parser");
const { port } = require("./config.js");
const Caver = require("caver-js");

const { add_nft_role } = require("./bot");      //bot  기능 구현 실행해서 켜줌        


/*main */
// const rpcURL = "https://public-node-api.klaytnapi.com/v1/cypress"
// const networkID = "8217"
// const caver = new Caver(rpcURL);
// const CONTRACT_ADDR = "0x970fd3b0e9d52f89c86ee6995e554258f77913b5";
// const WALLET_ADDR = "0x941a7a3a0b9b63d23d245e55cefc593ae0a63290";
// let contract = null;

/*test */
const rpcURL = "https://public-node-api.klaytnapi.com/v1/baobab"
const caver = new Caver(rpcURL);
const CONTRACT_ADDR = "0x4be460eecfb36fcc1379964ca9f330662f71578f";
let contract = null;

async function initContract() { //컨트렉트 설정
    contract = await caver.kct.kip17.create(CONTRACT_ADDR);
    console.log("initContract ok");
    // let ret;
    // ret = await contract.totalSupply();
    // console.log("totalSupply", ret);
    // ret = await contract.balanceOf(WALLET_ADDR);
    // console.log("balanceOf", ret);
  }
  initContract();



//////////////////////express 
const app = express();
app.use(bodyParser.json())

app.get("/", (req, res) => {
  return res.sendFile("index.html", { root: "." });
});

app.post("/api_discord_connect", async (req, res) => {  
    console.log("api_discord_connect", req.body);

    // 디스코드봇이 유저에게 권한을 준다.
    const { wallet_addr, discord_user_id } = req.body;
    ret = await contract.balanceOf(wallet_addr);
    const count = Number(ret);

    if (count < 1) {
      return res.json({
        code: -1,
        message: `count fail, ${count}`,
      });
    }
  
    console.log("count", count);
    add_nft_role(discord_user_id);  //프론트에서받은 아이디

    return res.json({
      code: 200,
      message: "ok",
    });
  });



app.post("/api_wallet", async (req, res) => {      //지갑연결 
    console.log("api_wallet", req.body);    
    const addr = req.body.addr;
    let ret = await contract.balanceOf(addr);   //컨트랙트에서 발란스 검사
    const count = Number(ret);
    console.log("count", count);
  
    return res.json({
      code: 200,
      message: "ok",
      count,
    });
  });
  



app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
