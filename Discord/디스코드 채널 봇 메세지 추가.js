// const { botToken } = require("./config.js");
const { Client, Intents } = require("discord.js");
const Discord = require("discord.js");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});
const botToken =
  "MTAwNzUwOTMxOTkyNDg2MzEwNw.GQJNjz.qT461TWUYqlmWrXAl3twLOsm5TGQEmiVBtB2AA"; // 봇토큰 넣어주세요
const GUILD_ID = "1007527513993527436";
const CHANNEL_ID = "1007527513993527439";
const ROLE_GOOD_ID = "1007542915435876362";
const MEMBER_ID = "994125110762020904";

client.once("ready", async () => {
  console.log(`Ready!`);
  const guild = client.guilds.cache.get(GUILD_ID);
  const channel = guild.channels.cache.get(CHANNEL_ID);
  console.log("channel :", channel.name);
  const role = guild.roles.cache.get(ROLE_GOOD_ID);
  const member = await guild.members.fetch(MEMBER_ID);
  console.log("member :", member.user.username);
  member.roles.add(role);     //권한추가
  member.roles.remove(role);  //권한 삭제
  channel.send("bot start");

  const ch_verify = guild.channels.cache.get(CHANNEL_ID);
  const old_msg = await ch_verify.messages.fetch();
  ch_verify.bulkDelete(old_msg);

  // Verify.ready(client);

  const embed = new Discord.MessageEmbed()
    .setColor('DARK_VIVID_PINK')    
    .setTitle("벨리곰  NFT 홀더인증")
    .setDescription("홀더 인증 링크입니다. 버튼을 클릭해 인증해 주세요!");

  const row = new Discord.MessageActionRow().addComponents(
    new Discord.MessageButton()
      .setLabel("인증하러가기")
      .setStyle("LINK")
      .setURL(
        "https://discord.com/api/oauth2/authorize?client_id=1008923766081986571&redirect_uri=https%3A%2F%2Fwww.bellygom.world%2Fverifier&response_type=code&scope=identify"
      )
  );
  return channel.send({ embeds: [embed], components: [row] });
});

client.login(botToken); //봇 토큰으로 로그인
console.log("login");
