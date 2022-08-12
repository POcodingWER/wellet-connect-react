const { botToken } = require("./config.js");
const { Client, Intents } = require("discord.js");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const GUILD_ID = "1007527513993527436";          //그룹아이디-> 우클릭 벨리곰 990785690579128340 
const ROLE_HOLDER_ID = "1007161191795273789";    //서버설정-> 역활-> 생성-> 역활 우클릭 -> ID 복사
const MEMBER_ID = "994125110762020904";         //서버에 있는 멤버중 한명 아이디 tset용
const CHANNEL_ID = "1007160972953276486";        //그룹안에 채널id-> 994124054283943986
const ROLE_GOOD_ID = "1007542915435876362";       //배찌아이디

client.once("ready", async () => {
  // console.log(`Ready!`);

  // console.log("membeddddddr");
  // const guild = client.guilds.cache.get(GUILD_ID);

  // const member = await guild.members.fetch(MEMBER_ID);
  // const role = guild.roles.cache.get(ROLE_GOOD_ID);
  //   console.log("membeddddddr", member.username);
  // // member.roles.add(role);
  //   member.roles.remove(role);
  // channel.send("bot start");
});


// //
// client.on("messageReactionAdd", async (reaction, user) => { //메세지 리액션 발생시 작동 
//     if (user.bot) return;       //봇인지확인
//     if (reaction.message.partial) await reaction.message.fetch();   //리액션확인
//     if (reaction.partial) await reaction.fetch();
//     if (!reaction.message.guild) return;
  
//     if (reaction.message.channelId == Verify.channel_id) {  //메세지온곳이 기능방이면 
//       Verify.reaction(reaction, user);
//     } else {
//       console.error("messageReactionAdd no ch");
//     }
//   });

// //이벤트시 발생함수
// client.on("messageCreate", async (msg) => {     //메세지 이벤트 발생시 작동
//   //
//   if (msg.author.bot) return;

//   if (msg.content == "a") {
//     msg.reply("b");
//   } else {
//     console.log("msg.content", msg.content);
//   }
// });


client.login(botToken); //봇 토큰으로 로그인
console.log("login");


async function add_nft_role(user_id) {  //홀더권한 ㅋ
  console.log("add_nft_role", user_id);

  const guild = client.guilds.cache.get(GUILD_ID);  //그룹아이디
  const role = guild.roles.cache.get(ROLE_GOOD_ID);  //권한
  const member = await guild.members.fetch(user_id);

  if(user_id === undefined){ return false;}
  member.roles.add(role);
  return true;
}

module.exports = {
  add_nft_role,
};
