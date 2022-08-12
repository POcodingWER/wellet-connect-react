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

const port = 4000;

const rpcURL = "https://public-node-api.klaytnapi.com/v1/baobab"; //test
// const rpcURL = "https://public-node-api.klaytnapi.com/v1/cypress"    //main
const contractAddress = "0x4effC40c01F77F274D059506fF884Ba000E16588";
const caver = new Caver(rpcURL);

//디스코드
const botToken =process.env.BOT_TOKEN;
const guilID = process.env.GUILD_ID; //그룹아이디-> 우클릭 벨리곰 990785690579128340
const roleID = process.env.ROLE_ID_NFT; //배찌아이디

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
};
