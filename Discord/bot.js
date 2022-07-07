const { botToken } = require("./config.js");
const { Client, Intents } = require("discord.js");
const Verify = require("./bot-verify");
 

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const GUILD_ID = "994124053830975488";          //그룹아이디-> 우클릭 벨리곰 990785690579128340 
const ROLE_HOLDER_ID = "994133151255363594";    //서버설정-> 역활-> 생성-> 역활 우클릭 -> ID 복사
const MEMBER_ID = "994125110762020904";         //서버에 있는 멤버중 한명 아이디 tset용
const CHANNEL_ID = "994124054283943986";     //그룹안에 채널id-> 994124054283943986
const ROLE_ID_NFT = "994155322971267073";


client.once("ready", async (c) => {     //준비
    console.log(`Ready!`); 
    const guild = client.guilds.cache.get(GUILD_ID);      //제일끝부분
    console.log("GUILD_ID", guild.name);
    const channel = guild.channels.cache.get(CHANNEL_ID); //채널
    console.log("channel", channel.type);

    const role = guild.roles.cache.get(ROLE_HOLDER_ID);
    // const member = guild.members.cache.get(MEMBER_ID);
    const member = await guild.members.fetch(MEMBER_ID);   //cache error 나서 안되면 fetch로 사용가능
    console.log("member", member.user.username);    //멤버정보 보기

    //권한 부여
    // member.roles.add(role);         // 멤버에 추가
    // member.roles.remove(role);   // 멤버에 삭제
    channel.send("bot start");      // 채널에 메세지 보낼수있다



    const ch_verify = guild.channels.cache.get(Verify.channel_id);  //공지방 채널 불러옴
    const old_msg = await ch_verify.messages.fetch();   //메세지가져와서
    ch_verify.bulkDelete(old_msg);      //삭제

    Verify.ready(client);
});


//
client.on("messageReactionAdd", async (reaction, user) => { //메세지 리액션 발생시 작동 
    if (user.bot) return;       //봇인지확인
    if (reaction.message.partial) await reaction.message.fetch();   //리액션확인
    if (reaction.partial) await reaction.fetch();
    if (!reaction.message.guild) return;
  
    if (reaction.message.channelId == Verify.channel_id) {  //메세지온곳이 기능방이면 
      Verify.reaction(reaction, user);
    } else {
      console.error("messageReactionAdd no ch");
    }
  });

//이벤트시 발생함수
client.on("messageCreate", async (msg) => {     //메세지 이벤트 발생시 작동
  //
  if (msg.author.bot) return;

  if (msg.content == "a") {
    msg.reply("b");
  } else {
    console.log("msg.content", msg.content);
  }
});


client.login(botToken); //봇 토큰으로 로그인
console.log("login");


async function add_nft_role(user_id) {  //홀더권한 ㅋ
  console.log("add_nft_role", user_id);

  const guild = client.guilds.cache.get(GUILD_ID);  //그룹아이디
  const role = guild.roles.cache.get(ROLE_ID_NFT);  //권한
  const member = await guild.members.fetch(user_id);
  if(user_id===undefined){ return false;}
  member.roles.add(role);
  return true;
}

module.exports = {
  add_nft_role,
};
