const fs = require('fs');
const record = require('/app/util/recRestart.json');

exports.run = (client, message) => {
  const embed = new client.embed()
    .setDescription('Restarting process...');
  let recordPush = `{ 
    "onRestart": true,
    "cid": "${message.channel.id}",
    "timestamp": ${message.timestamp}
  }`;
  fs.writeFile(
    '/app/util/recRestart.json', recordPush, async function (e) {
      if (e) throw (e);
      else {
        await message.reply({embed});
        process.exit();
      }
    }
  );
}

exports.conf = {
  module: 0,
  disabled: false,
  ownerOnly: true,
  guildOnly: false,
  aliases: [],
}

exports.help = {
  name: "restart",
  shortDesc: "Restarts process.",
  desc: "",
  usage: [" "],
  example: []
}