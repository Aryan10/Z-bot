exports.slash = {
  disabled: false,
  options: [],
}

exports.help = {
  name: "ping",
  shortDesc: "Ping pong."
}

exports.conf = {
  module: 0
}

exports.run = (client, message) => {
  const ping = new client.component.Button()
    .setLabel('Ping!')
    .setEmoji('🏓')
    .setStyle('blurple')
    .setID('ping');
  message.reply({content: '> Ping?', flags: 64}, ping)
    .then(msg => {
      let content = '> Pong! :ping_pong: Took ' + ((msg.createdAt || Date.now()) - message.createdAt) + ' ms';
      if (!message.data) client.editComponents(msg, ping, content);
    }
  );
}