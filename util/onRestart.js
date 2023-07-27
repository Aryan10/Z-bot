const fs = require('fs');
const record = require('./recRestart.json');

module.exports = (client) => {
  if (!record.onRestart) return;
  const embed = new client.embed()
    .setDescription('Restarted successfully.')
  fs.writeFile('/app/util/recRestart.json', '{}', async function (e) {
    if (e) throw e;
    let message = await client.createMessage(record.cid, {embed})
    message.edit({embed: embed.setFooter('Time Taken: ' + (message.timestamp - record.timestamp) + ' ms')});
  });
}