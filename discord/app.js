require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
// CTBOT 토큰
// OTYzMzM4NTkyNDg5NDcyMDEw.YlUo-g.HR5iRbPPAmcTnNBpycLb6grr75Q
// 열활 - 가입자권한: 965911754259443712
// 채널 - 권한부여방: 965914394968076328
//
// 디코봇 초대링크
// https://discord.gg/SxK7h9qvSx
// rediect url
// http://localhost:53134
// https://discord.com/api/oauth2/authorize?client_id=963338592489472010&redirect_uri=http%3A%2F%2Flocalhost%3A53134&response_type=code&scope=identify


const app = express();

app.use(bodyParser.json());

app.get("/", (request, response) => {
  return response.sned("connect server");
});
const port = process.env.PORT
app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
