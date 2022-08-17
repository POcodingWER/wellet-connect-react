const express = require("express");
const models = require("../models");
const { add_nft_role } = require("../bot");
const { Holder } = require("../models"); //dbtable 

const { port, caver, contractAddress, client_id, client_secret, redirect_uri, } = require("../config/config.js");
const app = express();
const cors = require("cors");

app.use(express.json()); //server open
app.use(cors());

app.get("/", (req, res) => {
  return res.send("GET request to the homepage");
});

//디스코드 get user id
app.post("/get_user_id", async (req, res) => {
  const url = "https://discord.com/api/oauth2/token"; // 디코에 post
  const { code } = req.body;
  try {
    const oauthResult = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({
        client_id,
        client_secret,
        code,
        grant_type: "authorization_code",
        redirect_uri,
        scope: "identify",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const oauthData = await oauthResult.json(); //json 으로 변경
    //디스코드에 토큰넘겨서 인증받은 디코 유저 id가져옴
    const userResult = await fetch("https://discord.com/api/users/@me", {
      headers: {
        authorization: `${oauthData.token_type} ${oauthData.access_token}`,
      },
    });
    const userData = await userResult.json();
    return res.json({
      code: 200,
      message: "ok",
      userID:userData.id,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      code: 400, 
      message: "유저정보 가져오기실패",
    });
  }
});

//홀더인증 API
app.post("/api_discord_connect", async (req, res) => {

  try {
    console.log("api_discord_connect", req.body);
    // 디스코드봇이 유저에게 권한을 준다.

    const { wallet_addr, discord_user_id, signature } = req.body;
    let sign_ret = await caver.validator.validateSignedMessage(
      "BellyGom Holder Verify", //메세지내용
      signature, //서명
      wallet_addr //지갑주소
    );

    console.log("sign_ret", sign_ret);
    if (!sign_ret) {
      return res.json({
        code: -1,
        message: `wallet sign fail`,
      });
    }
    
    async function isHolder(ownerAddress) {
      const htContract = new caver.contract(caver.klay.KIP17.abi, contractAddress);
      const balance = await htContract.methods.balanceOf(ownerAddress).call();
      return balance;
    }

    ret = await isHolder(wallet_addr);

    const count = Number(ret);
    if (count < 1) {
      return res.send({
        code: -1,
        message: `count fail, ${count}`,
      });
    }

    console.log("count", count);
    if (!(await add_nft_role(discord_user_id))) {
      //프론트에서받은 아이디
      return res.json({
        code: 400, 
        message: "등록실패",
      });
    }
    
    const find = await Holder.findOne({where:{discordId:discord_user_id}});
    if (!find) {
      await Holder.create({ address: wallet_addr, discordId: discord_user_id });
    } else {
      await Holder.update(
        { address: wallet_addr,},
        { where: { discordId: discord_user_id } }
      );
    }
    return res.json({
      code: 200,
      message: "ok",
      count
    });
  } catch (error) {
    console.log(error)
    return res.json({
      code: 400, 
      message: "등록실패",
    });
  }
  
});



models.sequelize //db연결
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
