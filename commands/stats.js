const {pokeParser} = require('/app/commands/pokedex.js');
const calc = require('/app/util/sim/statCalc.js').rawCalc;
const sprite = require('/app/util/dex/spriteLoader.js').pokemon;

const adaptLength = (string, number) => {
  let length = number - string.length;
  if (length >= 0) return string + " ".repeat(length);
}

const statNames = {
  hp: "HP",
  atk: "Attack",
  def: "Defense",
  spa: "Sp. Attack",
  spd: "Sp. Defense",
  spe: "Speed"
}

const embedColours = require('/app/util/embedColors.js').rawColors;

exports.slash = {
  disabled: false,
  options: [
    { 
      type: 3, 
      required: true,
      name: "pokemon", 
      description: "Specify pokemon name."
    },
    {
      type: 4, // integer
      required: false,
      name: "level",
      description: "Specify the level of pokemon."
    }
  ],
}

exports.run = (client, message) => {
  var custom;
  if (!message.args) {
    custom = true;
    let embed = message.message.embeds[0];
    message.args = [
      embed.author.name.slice(' ')[1],
      embed.title
    ];
  }
  if (!message.args[0]) message.args[0] = "";
  if (!message.args[0]) message.args[1] = "";
  let params = message.args.join(' ');
  var lvl, args;
  if (params.includes(',')) {
    args = params.split(',')[0];
    lvl = Number(params.split(',')[1].replace(/ /g, ''));
    if (!lvl) lvl = 100;
  } else {
    args = params.split(' ').slice(1).join(' ');
    lvl = Number(params.split(' ')[0]);
    if (!lvl) {
      args = params.split(' ').join(' ');
      lvl = 100;
    }
  }
  message.args = args.split(' ');
  let dex = pokeParser(message, message.args, false);
  if (!dex) return message.reply("> No pokemon found.");
  
  let {baseStats} = dex;
  let stats = {}
  stats.name = Object.keys(baseStats);
  stats.base = Object.values(baseStats);
  stats.min = [];
  stats.max = [];
  stats.name.forEach(s => {
    let i = stats.name.indexOf(s);
    stats.min.push(calc(s, stats.base[i], lvl, 0, 0, 0.9));
    stats.max.push(calc(s, stats.base[i], lvl, 31, 252, 1.1));
  });
  
  var displayStatType;
  if (!custom) displayStatType = 'Min     Max';
  else displayStatType = "Stats   EVs";
  let listArray = ['```STAT            ' + 'Base    ' + displayStatType, '\n'];
  if (!custom) stats.name.forEach(s => {
    let i = stats.name.indexOf(s);
    listArray.push(
      adaptLength(statNames[s], 16) + adaptLength(String(stats.base[i]), 8) + adaptLength(String(stats.min[i]), 8) + adaptLength(String(stats.max[i]), 8));
  });
  const spreadMenu = new client.component.Menu();
  const statsEmbed = new client.embed()
    .setTitle(dex.name)
    .setAuthor('Level ' + lvl, sprite(dex).icon)
    .setDescription(
      listArray.join('\n') + '```')
    .setColor(embedColours[dex.color]);
  if (custom) statsEmbed.setFooter();
  message.reply({embed: statsEmbed});
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: []
}

exports.help = {
  name: "stats",
  shortDesc: "Displays pokemon stats.",
  desc: "Displays the base, minimum and maximum stats of the specified pokemon at a particular level. Level defaults to 100 if unspecified.",
  usage: ["stats [level] <pokemon name>"],
  example: ["stats charizard", "stats 50 mega mewtwo y"],
}

const spreads = {
  "Fast Physical Sweeper": {
    evs: {atk: 252, spd: 4, spe: 252},
    nature: "jolly", 
  },
  "Fast Special Sweeper": {
    evs: {spa: 252, spd: 4, spe: 252},
    nature: "timid",
  },
  "Mixed Physical Sweeper": {
    evs: {atk: 252, spa: 4, spe: 252},
    nature: "naive",
  },
  "Mixed Special Sweeper": {
    evs: {atk: 4, spa: 252, spe: 252},
    nature: "hasty",
  },
  "Bulky Physical Sweeper": {
    evs: {hp: 252, atk: 252, spd: 4},
    nature: "adamant",
  },
  "Bulky Special Sweeper": {
    evs: {hp: 252, spa: 252, spd: 4},
    nature: "modest",
  },
  "Physically Defensive": {
    evs: {hp: 252, def: 252, spd: 4},
    nature: "impish",
  },
  "Specially Defense": {
    evs: {hp: 252, def: 4, spd: 252},
    nature: "calm",
  },
  "Fast Bulky Support": {
    evs: {hp: 252, spd: 4, spe: 252},
    nature: "timid",
  },
}