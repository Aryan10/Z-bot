const Natures = require('/app/data/natures.js');
const embedColours = require('/app/util/embedColors.js').rawColors;

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
const flavour = {
  atk: "Spicy",
  def: "Sour",
  spa: "Dry",
  spd: "Bitter",
  spe: "Sweet",
}
const confusionBerry = {
  atk: "Figy",
  def: "Iapapa",
  spa: "Wiki",
  spd: "Aguav",
  spe: "Mago"
}

exports.run = (client, message) => {
  let args = message.args.join('').toLowerCase();
  let nature = Natures[args];
  if (!nature) {
    const chartEmbed = new client.embed()
      .setTitle('Pokemon Nature Chart')
      .setColor(client.config.color)
      .setImage('https://cdn.glitch.global/8e812b32-a686-4403-9179-5932b89c1620/Pokemon_Nature_Chart.jpeg?v=1690880002764')
      .setFooter('Type ' + client.config.prefix + this.help.usage[0] + ' to get information on a specific nature.');
    return message.reply({embed: chartEmbed});
  }
    
// "```0   ║↑ Atk  │↑ Def  │↑ SpA  │↑ SpD  │↑ Spe\n════╬═══════╪═══════╪═══════╪═══════╪═══════\n↓Atk║Hardy  │Bold   │Modest │Calm   │Timid\n↓Def║Lonely │Docile │Mild   │Gentle │Hasty\n↓SpA║Adamant│Impish │Bashful│Careful│Jolly\n↓SpD║Naughty│Lax    │Rash   │Quirky │Naive\n↓Spe║Brave  │Relaxed│Quiet  │Sassy  │Serious```"
  let { plus, minus } = nature;
  
  var color;
  if (!plus) color = embedColours.White;
  if (plus == 'atk' || plus == 'spa' || plus == 'spe') color = embedColours.Red;
  else if (plus == 'def' || plus == 'spd') color = embedColours.Blue;
  var neutral;
  
  if (!plus) {
    neutral = true;
    plus = neutralNatures[nature.name];
    minus = plus;
  }
  
  let likes = flavour[plus].toLowerCase();
  let dislikes = flavour[minus].toLowerCase();
  var taste = "Has no particular preference."
  if (likes != dislikes) taste = `Likes **${likes}** food. Dislikes **${dislikes}** food.`;
  
  const naturalEmbed = new client.embed()
    .setColor(color)
    .setTitle(nature.name)
    .addField('Nature Increases', stats[plus], true)
    .addField('Nature Decreases', stats[minus], true)
    .addField('Taste Preferences', taste);
  if (!neutral) naturalEmbed.setFooter('Confused by ' + confusionBerry[minus] + ' Berry');
  
  message.reply({embed: naturalEmbed});
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: ['natures'],
}

exports.help = {
  name: "nature",
  shortDesc: "Display nature information.",
  desc: "Displays various information about the specified nature, such as the stats affected and taste preferences. Shows a table including all natures if none specified.",
  usage: ["nature [nature name]"],
  example: ['nature brave'],
}

exports.slash = {
  disabled: false,
  options: [
    { 
      type: 3, 
      required: false,
      name: "nature", 
      description: "Specify pokemon nature."
    }
  ],
}