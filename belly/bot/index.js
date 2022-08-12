const { botToken, GUILD_ID, ROLE_ID_NFT } = require("../config/config.js");
const { Client, Intents } = require("discord.js");
const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
  });

client.login(botToken); //봇 토큰으로 로그인  그래야 권한줄수있음
console.log("login");


async function add_nft_role(user_id) {  //홀더권한 ㅋ
    console.log("add_nft_role", user_id);
  
    const guild = client.guilds.cache.get(GUILD_ID);  //그룹아이디
    const role = guild.roles.cache.get(ROLE_ID_NFT);  //권한
    const member = await guild.members.fetch(user_id);

    if(user_id === null){ return false;}
        member.roles.add(role);
    return true;
  }
  
module.exports = {
    add_nft_role,
};