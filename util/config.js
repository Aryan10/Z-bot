const pkg = require('/app/package.json');

let prefix = "!";
let version = "Alpha " + pkg.version;

// status
/* 
  status: "online", "idle", "dnd", "invisible"
  name: 
  type: 0: "playing", 1: "streaming", 2: "listening", 3: "watching", 5: "competing in"
  url: 
*/
let url = 'https://glitch.com/edit/#!/discord-frontier';
let devStatus = {
  status: "dnd", type: 5, url,
  name: version + ' | ' + prefix + 'help',
}
let status = {
  status: "online", type: 3,
  name: '/help | ' + prefix + 'help'
}

// inviteURL
let client_id = "405365319901904899",
    permissions = "26932331150400";

module.exports = {
  username: "Z-bot",
  maxShards: 2,
  token: process.env.DISCORD_TOKEN,
  
  color: 15277667,
  prefix: prefix,
  version: version,
  status: status,
  
  guildInviteURL: 'https://discord.gg/42csE92',
  inviteURL: `https://discord.com/api/oauth2/authorize?client_id=${client_id}&permissions=${permissions}&scope=bot`,
  
  botOwners: [
    "273865811133857792", // aryan.10
    "280749589974482945" // ryan3770
  ],
  botChannels: [
    "643679158789996550"
  ],
}