const app = require('express')();
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);

const log = require('/app/util/log.js');
const config = require("/app/util/config.js");
const fs = require("fs");
const Client = require("eris");
const Components = require("eris-components");
const Discord = require("discord.js");

// initiate client
const clientOptions = {
  maxShards: config.maxShards
}
const bot = new Client(config.token, clientOptions);
const componentClientOptions = {
  debug: false,
  invalidClientInstanceError: true,
  ignoreRequestErrors: false
}
const client = Components.Client(bot, componentClientOptions);

// client definitions
client.config = config;
client.embed = Discord.RichEmbed;
client.component = Components;

client.commands = new Client.Collection();
client.aliases = new Client.Collection();

// load commands
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  else if (files) {
    files.forEach((f) => {
      let cmd = require("./commands/" + f);
      client.commands.set( cmd.help.name, cmd);
      if (cmd.conf && cmd.conf.aliases) cmd.conf.aliases.forEach((i) => {
        client.aliases.set(i, cmd.help.name);
      });
    });
  }
});
const msgError = (e) => "Oops. An error occured.\n```ERROR: " + e.message + "```";

// on ready
client.on("ready", async () => {
  console.log(client.user.username + " Ready!" + " " + config.version);
  let { status } = config;
  status.status = status.status
    .replace('%servers%', client.guilds.size);
  await client.editStatus(status.status, status);
  require('/app/util/onRestart.js')(client);
  
  if (client.user.username !== config.username) {
    await client.editSelf({
      username: config.username
    });
  }
  
  // slash command handler
  client.commands.forEach(cmd => {
    if (cmd.slash && !cmd.slash.disabled) client.createCommand({
      name: cmd.help.name,
      description: cmd.help.shortDesc,
      options: cmd.slash.options,
      type: 1
    });
  });
});

// on message
client.on("messageCreate", (message) => {
  message.reply = (content, components) => {
    let options = content;
    if (typeof options === "string") options = { content };
    options.messageReference = {
      messageID: message.id
    }
    if (options.embed) {
      options.embeds = [options.embed];
      delete options.embed;
    }
    if (!components) return client.createMessage(message.channel.id, options);
    else return client.sendComponents(message.channel.id, components, options);
  }
  // command handler
  if (!message.content.startsWith(config.prefix)) return;
  log(client, message);
  
  let command = message.content
    .slice(config.prefix.length)
    .split(" ")[0];
  let args = message.content.split(" ").slice(1);
  let cmd;

  if (client.commands.has(command.toLowerCase())) cmd = client.commands.get(command.toLowerCase());
  else if (client.aliases.has(command.toLowerCase()))
    cmd = client.commands.get(client.aliases.get(command.toLowerCase()));
  else return;
  
  let isOwner = config.botOwners.includes(message.author.id);
  if (cmd.conf) {
    // disabled
    if (cmd.conf.disabled) return;
    // ownerOnly
    if (cmd.conf.ownerOnly && !isOwner) return;
    // guildOnly
    if (cmd.conf.guildOnly && !message.guildID) return message.reply("Sorry, this command can only be used in a server.");
  }
  
  // run
  message.args = args;
  
  try {
    cmd.run(client, message)
  } catch (e) {
    message.reply(msgError(e));
    console.log(e);
  }
});

// on slash command
client.on('slashCommandInteract', (interaction) => {
  interaction.reply = (content, components) => {
    if (content.embed) {
      content.embeds = [content.embed];
      delete content.embed;
    }
    return client.replyInteraction(
      interaction, components || null, content);
  }
  
  
  log(client, interaction);
  let args = [];
  let { options } = interaction.data;
  if (options) {
    if (options.length == 1) args = options[0].value.split(' ');
    else {
      let params = [];
      options.forEach(d => {
        params.push(d.value);
      });
      args = params.join(',').split(' ');
    }
  }
  interaction.args = args;
  
  let cmd = client.commands.get(interaction.data.name);
  if (!cmd) cmd = client.commands.get(client.aliases.get(interaction.data.name))
  try {
    cmd.run(client, interaction);
  } catch (e) {
    interaction.reply(msgError(e));
    console.log(e);
  }
});

// on interaction
client.on('clickButton', (interaction) => {
  log(client, interaction);
  try {
    const res = require('/app/interactions/clickButton/' + interaction.data.custom_id.split(' ')[0] + '.js');
    res(client, interaction);
  }
  catch (e) {
    client.replyInteraction(
      interaction, null, msgError(e));
    console.log(e);
  }
});

client.on('submitMenu', (interaction) => {
  log(client, interaction);
  try {
    const res = require('/app/interactions/submitMenu/' + interaction.data.custom_id.split(' ')[0] + '.js');
    res(client, interaction);
  } catch (e) {
    client.replyInteraction(
      interaction, null, msgError(e));
    console.log(e);
  }
});

client.connect();
