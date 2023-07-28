const pkg = require('/app/package.json');
const bot = require('/app/botConfig.js');
let version = bot.version + " " + pkg.version;

// status
let url = 'https://glitch.com/edit/#!/' + process.env.PROJECT_DOMAIN;
let devStatus = {
  status: "dnd", type: 5, url,
  name: version + ' | ' + bot.prefix + 'help',
},
    publicStatus = {
  status: "online", type: 3,
  name: '/help | ' + bot.prefix + 'help'
}
let status = bot.indev === true ? devStatus : publicStatus;

// inviteURL
let permissionRequested = "26932331150400";

module.exports = {
  username: bot.username,
  maxShards: bot.maxShards,
  token: bot.token,
  
  color: bot.color,
  prefix: bot.prefix,
  version: version,
  status: status,
  
  guildInviteURL: 'https://discord.gg/' + bot.guildInvite,
  inviteURL: (client) => `https://discord.com/api/oauth2/authorize?client_id=${client.application.id}&permissions=${permissionRequested}&scope=bot`,
  
  botOwners: bot.botOwners
}



// // status

/* 

  status: "online", "idle", "dnd", "invisible"

  name: 

  type: 0: "playing", 1: "streaming", 2: "listening", 3: "watching", 5: "competing in"

  url: 

*/