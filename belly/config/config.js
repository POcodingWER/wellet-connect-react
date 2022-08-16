require("dotenv").config();
const Caver = require("caver-js");

const development = {
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
  dialect: "mysql",
  logging: false,
};

const test = {
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
  dialect: "mysql",
};

const production = {
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
  dialect: "mysql",
};

const port = process.env.PROT;

// const rpcURL = "https://public-node-api.klaytnapi.com/v1/baobab"; //test
const rpcURL = "https://public-node-api.klaytnapi.com/v1/cypress"    //main
const contractAddress = process.env.CONTRACT_ADDRESS;
const caver = new Caver(rpcURL);

//디스코드
const botToken = process.env.BOT_TOKEN;      
const guilID = process.env.GUILD_ID;        //그룹아이디-> 우클릭 벨리곰 990785690579128340
const roleID = process.env.ROLE_ID_NFT;     //배찌아이디
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET; //만이 호출하면 끊기나봄 ㅠ~
const redirect_uri = process.env.REDIRECT_URL;

module.exports = {
  development,
  test,
  production,
  port,
  caver,
  contractAddress,
  botToken,
  guilID,
  roleID,
  client_id,
  client_secret,
  redirect_uri,
};
