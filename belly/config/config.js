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

const rpcURL = "https://public-node-api.klaytnapi.com/v1/baobab"    //test
// const rpcURL = "https://public-node-api.klaytnapi.com/v1/cypress"    //main
const contractAddress = "0xFB9122f14DD164Fa158382A85b4958E12d57642e";
const caver = new Caver(rpcURL);

//디스코드 
const botToken = "OTk0MDgyNzk4NzcwMDY5NTE2.G7ezbV.Hu-l-MjTpuyrjgmM0yYID_iIj58B9Dkf_bHp90"


const GUILD_ID = "1007159506851078214";          //그룹아이디-> 우클릭 벨리곰 990785690579128340 
const ROLE_HOLDER_ID = "994133151255363594";    //서버설정-> 역활-> 생성-> 역활 우클릭 -> ID 복사
const MEMBER_ID = "994125110762020904";         //서버에 있는 멤버중 한명 아이디 tset용
const CHANNEL_ID = "1007160972953276486";        //그룹안에 채널id-> 994124054283943986
const ROLE_ID_NFT = "1007161191795273789";       //배찌아이디


module.exports = { development, test, production, port, caver, contractAddress, botToken, GUILD_ID, ROLE_ID_NFT };