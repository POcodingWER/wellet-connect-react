const express = require("express");
const models = require("./models");
const { add_nft_role } = require("./bot");

const {port, caver, contractAddress} = require("./config/config.js");
const app = express();
const cors = require("cors");

app.use(express.json());  //server open
app.use(cors());

app.get("/", (req, res) => {
  return res.send('GET request to the homepage');
});


//홀더인증 API
app.post("/api_discord_connect", async (req, res) => {  
  contract = await caver.kct.kip17.create(contractAddress);
  console.log("api_discord_connect", req.body);
  // 디스코드봇이 유저에게 권한을 준다.
  const { wallet_addr, discord_user_id, signature } = req.body;
  let sign_ret = await caver.validator.validateSignedMessage(
    "belly gom discord",    //메세지내용
    signature,              //서명
    wallet_addr             //지갑주소 
  );
  console.log("sign_ret", sign_ret);
  if (!sign_ret) {
    return response.json({
      code: -1,
      message: `wallet sign fail`,
    });
  }

  ret = await contract.balanceOf(wallet_addr);
  const count = Number(ret);

  if (count < 1) {
    return res.json({
      code: -1,
      message: `count fail, ${count}`,
    });
  }

  console.log("count", count);
  
  if(! await add_nft_role(discord_user_id)){ //프론트에서받은 아이디
    return res.json({
      code: 400,
      message: "등록실패",
    });
  } 

  return res.json({
    code: 200,
    message: "ok",
  });
});

models.sequelize    //db연결
  .sync()
  .then(() => {
    console.log(" DB 연결 성공");
  })
  .catch((err) => {
    console.log("연결 실패");
    console.log(err);
  });

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
