const { botToken,guilID,roleID } = require("../config/config.js");
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

async function add_nft_role(user_id) {    //홀더권한 부여 함수
  
  try {
    const guild = client.guilds.cache.get(guilID); //그룹아이디
    // console.log(guild.name);
    const role = guild.roles.cache.get(roleID); //권한
    const member = await guild.members.fetch(user_id);

    if (user_id === undefined) {
      return false;
    }
    member.roles.add(role);
    return true;
  } catch (error) {
    console.log(error);
  }
}
  
module.exports = {
    add_nft_role,
};