const ItemText = require('/app/data/text/items.js');
const { Items } = require('/app/data/items.js');
var numObj = {};
Object.keys(Items).forEach(name => {
  var { num } = Items[name];
  if (!numObj[num]) {
    numObj[num] = { num, name };
  }
});
let numArray = Object.keys(numObj);

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
      name: "item", 
      description: "Specify pokemon hold item name."
    }
  ],
}

exports.run = (client, message, caller_id) => {
  if (caller_id) {
    let embed = message.message.embeds[0];
    var number = embed.footer.text.slice(1).split(' ')[0];
    let trueNum = numArray.indexOf(number),
        prev = numObj[numArray[trueNum - 1]],
        next = numObj[numArray[trueNum + 1]];
    if (caller_id == "prev" && prev) message.args = [prev.num];
    else if (caller_id == "next" && next) message.args = [next.num];
    else message.args = [];
  }
  let params = message.args.join(''),
      args = params.toLowerCase().replace(/-/g, '').replace(/'/g, '');
  let item = ItemText[args];
  let data = Items[args];
  if (numObj[params]) {
    item = ItemText[numObj[params].name];
    data = Items[numObj[params].name];
  }
  let errorMsg = '> Hold item not found.';
  if (!item) {
    return (message.reply ? message.reply(errorMsg) : client.replyInteraction(message, null, { content: errorMsg, flags: 64 }));
  }
  
  const itemEmbed = new client.embed()
    .setTitle(item.name)
    .setDescription(item.desc)
    .setColor(embedColours.Normal);
  
  if (data.megaStone) itemEmbed.addField('Mega Evolves', data.megaEvolves + ' —> '  + data.megaStone);
  else if (data.itemUser) itemEmbed.addField('Item User', data.itemUser.join(', '));
  if (data.zMoveFrom) itemEmbed.addField('Z-Move: ' + data.zMove, 'From **' + data.zMoveFrom + '**');
  else if (data.zMoveType) {
    itemEmbed.addField('Z-Move', data.zMoveType).setColor(embedColours[data.zMoveType]);
  }
  else if (data.onPlate) itemEmbed.setColor(embedColours[data.onPlate]);
  
  if (data.fling) {
    let flingarray = [ 'Base Power: **' + data.fling.basePower + '**' ];
    if (data.fling.status) flingarray.push('Inflicts **' + data.fling.status.toUpperCase() + '**');
    itemEmbed.addField('Fling', flingarray.join('\n'));
  }
  if (data.naturalGift) itemEmbed.addField('Natural Gift', `Base Power: **${data.naturalGift.basePower}**\nType: **${data.naturalGift.type}**`).setColor(embedColours[data.naturalGift.type]);
  
  let footer = '#' + data.num;
  if (data.gen) footer += ' Introduced in Generation ' + data.gen;
  itemEmbed
    .setFooter(footer)
    .setThumbnail('https://play.pokemonshowdown.com/sprites/itemicons/' + item.name.toLowerCase().replace(/ /g, '-').replace(/'/g, '') + '.png');
  
  const buttonPrev = new client.component.Button()
    .setStyle('gray')
    .setLabel('Previous')
    .setEmoji('◀️')
    .setID('pokedexModule item prev');
  const buttonNext = new client.component.Button()
    .setStyle('gray')
    .setLabel('Next')
    .setEmoji('▶️')
    .setID('pokedexModule item next');
  const buttonRow = new client.component.ActionRow()
    .addComponents([buttonPrev, buttonNext]);
  
  if (message.reply) message.reply({embed: itemEmbed}, [buttonRow])
  else client.editInteraction(message, [buttonRow], {embeds: [itemEmbed]});
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: [],
}

exports.help = {
  name: "item",
  shortDesc: "Displays hold item information.",
  desc: "Displays various information about the specified hold item, such as image, item usage and effect.",
  usage: "item <item name>",
  example: ['item pokeball', 'item choice scarf'],
}