const MovesText = require('/app/data/text/moves.js');
const MovesData = require('/app/data/moves.js').Moves;
const Items = require('/app/data/text/items.js');
const typeIMG = require('/app/util/spriteLoader').type;
var numObj = {};
Object.keys(MovesData).forEach(name => {
  var { num } = MovesData[name];
  if (!numObj[num]) numObj[num] = name;
});

const targetTypes = {
  normal: "May affect any adjacent pokemon",
  randomNormal: "Randomly affects anyone adjacent to user",
  adjacentAlly: "May affect any adjacent ally",
  adjacentFoe: "May affect any adjacent foe",
  allAdjacentAllies: "Affect all adjacent allies",
  allAdjacentFoes: "Affects all adjacent foes",
  allAdjacent: "Affects all adjacent pokemon",
  any: "May affect any pokemon",
  self: "Affects user",
  allies: "Affects all allies",
  foes: "Affects all foes",
  all: "Affects all pokemon on field",
  allySide: "Affects all allies on field",
  foeSide: "Affect all foes on field",
}
const embedColours = {
    Fire: 16724530,
    Water: 2456831,
    Ice: 2456831,
    Flying: 2456831,
    Dragon: 2456831,
    Electric: 16773977,
    Grass: 4128590,
    Bug: 4128590,
    Dark: 3289650,
    Rock: 10702874,
    Ground: 10702874,
    Fighting: 10702874,
    Poison: 10894824,
    Ghost: 9868950,
    Steel: 9868950,
    Normal: 14803425,
    'undefined': 14803425,
    Psychic: 16737701,
    Fairy: 16737701
}

exports.slash = {
  disabled: false,
  options: [
    { 
      type: 3, 
      required: true,
      name: "move", 
      description: "Specify pokemon move name."
    }
  ],
}

exports.run = (client, message, caller_id) => {
  if (caller_id) {
    let embed = message.message.embeds[0];
    var number = Number(embed.author.name.slice(1).split(' ')[0]);
    if (caller_id == "prev") message.args = [String(number - 1)];
    if (caller_id == "next") message.args = [String(number + 1)];
  }
  let params = message.args.join(''),
      args = params.toLowerCase().replace(/,/g, '').replace(/'/g, '').replace(/-/g, '').replace('gigantamax', 'gmax');
  let move = MovesText[args];
  let data = MovesData[args];
  if (numObj[params]) {
    move = MovesText[numObj[params]];
    data = MovesData[numObj[params]];
  }
  let errorMsg = '> Move not found.';
  if (!move && message.reply) return message.reply(errorMsg);
  if (!move || (!message.reply && data.num < 1)) return client.replyInteraction(
    message, null, {
      content: errorMsg,
      flags: 64
  });
  
  let desc = move.desc || move.shortDesc;
  if (desc === 'No additional effect.') desc = move.shortDesc;
  let flags = [];
  if (data.flags.contact) flags.push('**Makes Contact**');
  if (data.flags.sound) flags.push('**Sound-Based**');
  if (data.flags.powder) flags.push('**Powder Move**');
  if (data.flags.punch) flags.push('Boosted by Iron Fist');
  if (data.flags.pulse) flags.push('Boosted by Mega Launcher');
  if (data.flags.bite) flags.push('Boosted by Strong Jaw');
  if (data.flags.bullet) flags.push('Does not affect Bulletproof');
  if (data.isZ) flags.push(`Z-Move (${Items[data.isZ].name})`);
  if (data.isMax) {
    if (typeof data.isMax === "string") flags.push(`Gigantamax Move (${data.isMax})`)
    else flags.push('Max Move')
  }
  let flagstrarray = [];
  flags.forEach(i=>flagstrarray.push('• ' + i));
  if (flags) desc += '\n' + flagstrarray.join('\n');
  
  let acc = data.accuracy;
  if (acc === true) acc = 'Never Miss';
  
  let target = targetTypes[data.target];
  if (!target) console.error(data.target);
  let footer = 'TARGET: ' + (target || data.target);
  
  const moveEmbed = new client.embed()
    .setTitle(move.name)
    .setDescription(desc)
    .addField('Base Power', data.basePower, true)
    .addField('Accuracy', acc, true)
    .addField('Type: ' + data.type, 'Category: **' + data.category + '**')
    .addField('Base PP', `${data.pp} (${Math.floor(data.pp*1.6)} Max)`, true)
    .addField('Priority', data.priority, true)
    .setColor(embedColours[data.type])
    .setAuthor('#' + data.num, 'https://play.pokemonshowdown.com/sprites/categories/' + data.category + '.png')
    .setThumbnail(
      typeIMG(data.type).type)
    .setFooter(footer);
  
  const buttonPrev = new client.component.Button()
    .setStyle('gray')
    .setLabel('Previous')
    .setEmoji('◀️')
    .setID('pokedexModule move prev');
  const buttonNext = new client.component.Button()
    .setStyle('gray')
    .setLabel('Next')
    .setEmoji('▶️')
    .setID('pokedexModule move next');
  const buttonRow = new client.component.ActionRow()
    .addComponents([buttonPrev, buttonNext]);
  
  if (message.reply) message.reply({embed: moveEmbed}, [buttonRow])
  else client.editInteraction(message, [buttonRow], {embeds: [moveEmbed]});
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: [],
}

exports.help = {
  name: "move",
  shortDesc: "Displays move information.",
  desc: "Displays various information about the specified move such as Type, Base Power, Effects etc.",
  usage: "move <move name>",
  example: ["move thunder "],
}