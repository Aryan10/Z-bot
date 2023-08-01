const Client = require('eris');

const clean = text => {
  if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else return text;
}

exports.run = (client, message) => {
  let code = message.args.join(" ").replace(/`/g, '');
  if (!code) return;

  try {
    let evaled = eval(code);
    if (typeof eval !== 'string') evaled = require('util').inspect(evaled);
    const evalEmbed = new client.embed()
      .setColor(3447003)
      .setAuthor("EVAL CODE", client.user.defaultAvatarURL)
      .addField("Eval Input", "```" + code + "```")
      .addField("Eval Output", "```" + clean(evaled) + "```");
    message.reply({embed: evalEmbed});
  } catch (err) {
    const errEmbed = new client.embed()
      .setColor(0xF44336)
      .setAuthor("EVAL CODE", client.user.defaultAvatarURL)
      .addField("Eval Input", "```" + code + "```")
      .addField("Eval Error", "```" + clean(err) + "```");
    console.log(err);
    message.reply({embed: errEmbed});
  }
}

exports.conf = {
  module: 0,
  disabled: false,
  ownerOnly: true,
  guildOnly: false,
  aliases: [],
}

exports.help = {
  name: "eval",
  shortDesc: "Evals code.",
  desc: "",
  usage: ["eval <code>"],
  example: [],
}