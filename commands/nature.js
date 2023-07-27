const Natures = require('/app/data/natures.js');

const embedColours = {
  Red: 16724530,
  Blue: 2456831,
  White: 14803425
}
const neutralNatures = {
  Hardy: 'atk',
  Docile: 'def',
  Bashful: 'spa',
  Quirky: 'spd',
  Serious: 'spe'
}

const stats = {
  atk: "Attack",
  def: "Defense",
  spa: "Special Attack",
  spd: "Special Defense",
  spe: "Speed"
}

exports.run = (client, message) => {
  let args = message.args.join('').toLowerCase();
  let nature = Natures[args];
  if (!nature) message.reply("> Nature not found.");
  let { plus, minus } = nature;
  
  var color;
  if (!plus) color = embedColours.White;
  if (plus == 'atk' || plus == 'spa' || plus == 'spe') color = embedColours.Red;
  else if (plus == 'def' || plus == 'spd') color = embedColours.Blue;
  
  if (!plus) {
    plus = neutralNatures[nature.name];
    minus = plus;
  }
  
  const naturalEmbed = new client.embed()
    .setColor(color)
    .setTitle(nature.name)
    .addField('Nature Increases', stats[plus], true)
    .addField('Nature Decreases', stats[minus], true);
  message.reply({embed: naturalEmbed});
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: [],
}

exports.help = {
  name: "nature",
  shortDesc: "Display nature information.",
  desc: "Displays various information about the specified nature, such as the stats affected.",
  usage: "nature <nature name>",
  example: ['nature brave'],
}

exports.slash = {
  disabled: false,
  options: [
    { 
      type: 3, 
      required: true,
      name: "nature", 
      description: "Specify pokemon nature."
    }
  ],
}