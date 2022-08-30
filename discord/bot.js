require("dotenv").config();
const { Client, Intents, MessageEmbed } = require("discord.js");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const GUILD_ID = "1007527513993527436";
const ROLE_GOOD_ID = "1007542915435876362";
const ROLE_first_ID = "1007540133190443069";
const MEMBER_ID = "994125110762020904";
const CHANNEL_ID = "1007527513993527439";
const EMOJI = "✅";

async function ready(client) {
  const ch = await client.channels.fetch(CHANNEL_ID);

  const embed = new MessageEmbed() //
    .setTitle(`안녕하세요`)
    .setDescription(`${EMOJI} 눌러 가입하세요`);
  ch.send({ embeds: [embed] }).then((msg) => {
    console.log("verify send ok");
    msg.react(EMOJI);
  });

  const embed2 = new MessageEmbed() //
    .setTitle("여기를 눌러 지갑을 연동 하기")
    .setDescription(`위에 문구를 눌러서 지갑을 연동하세요`)
    .setURL("");
  ch.send({ embeds: [embed2] }).then(() => {});
}

async function reactionreturn(reaction, user) {
  if (reaction.emoji.name == EMOJI) {
    console.log("messageReactionAdd ok", EMOJI);
    const guild = reaction.message.guild;
    const role = guild.roles.cache.get(ROLE_first_ID);
    const member = guild.members.cache.get(user.id);
    await member.roles.add(role);
  } else {
    console.log("messageReactionAdd unknown emoji");
  }
}

client.once("ready", async () => {
  console.log(`Ready!`);

  const guild = client.guilds.cache.get(GUILD_ID);
  const channel = guild.channels.cache.get(CHANNEL_ID);
  console.log("channel", channel.name);
  const role = guild.roles.cache.get(ROLE_GOOD_ID);
  const member = await guild.members.fetch(MEMBER_ID);
  console.log("member", member.user.username);
  member.roles.add(role);
  // member.roles.remove(role);
  channel.send('bot start gogogogogo');

  const ch_verify = guild.channels.cache.get(CHANNEL_ID);
  const old_msg = await ch_verify.messages.fetch();
  ch_verify.bulkDelete(old_msg);

  ready(client);
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (!reaction.message.guild) return;
  if (reaction.message.channelId == 1007527513993527439) {
    reactionreturn(reaction, user);
  } else {
    console.error("messageReactionAdd no ch");
  }
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content == "a") {
    msg.reply("b");
  } else {
    console.log("msg.content", msg.content);
  }
});

client.login(process.env.BOT_TOKEN);
console.log("login");

const ROLE_ID_NFT = "973527998605185024";
async function add_nft_role(user_id) {
  console.log("add_nft_role", user_id);

  const guild = client.guilds.cache.get(GUILD_ID);
  const role = guild.roles.cache.get(ROLE_ID_NFT);
  const member = await guild.members.fetch(user_id);
  member.roles.add(role);
}

module.exports = {
  add_nft_role,
};
