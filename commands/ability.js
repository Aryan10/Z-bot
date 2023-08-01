const AbilityText = require('/app/data/text/abilities.js');
const { Abilities } = require('/app/data/abilities.js');
var numObj = {};
Object.keys(Abilities).forEach(name => {
  var { num } = Abilities[name];
  if (!numObj[num]) numObj[num] = name;
});

const rating = {
	"-1": "Detrimental",
	"0": "Useless",
	"1": "Ineffective",
	"2": "Useful",
	"3": "Effective",
	"4": "Very Useful",
	"5": "Essential"
}

exports.run = (client, message, caller_id) => {
  if (caller_id) {
    let embed = message.message.embeds[0];
    var number = Number(embed.footer.text.slice(1).split(' ')[0]);
    if (caller_id == "prev") message.args = [String(number - 1)];
    if (caller_id == "next") message.args = [String(number + 1)];
  }
  let params = message.args.join(''),
      args = params.toLowerCase().replace(/-/g, '').replace(/'/g, "");
  let ability = AbilityText[args];
  let data = Abilities[args];
  if (numObj[params]) {
    ability = AbilityText [numObj[params]];
    data = Abilities[numObj[params]];
  }
  let errorMsg = "> Ability not found.";
  if (!ability) return message.reply ? message.reply(errorMsg) : client.replyInteraction(message, null, { content: errorMsg, flags: 64 });
  
  const abilityEmbed = new client.embed()
    .setColor(14803425)
    .setTitle(ability.name)
    .setDescription(ability.desc || ability.shortDesc)
    .setFooter('#' + data.num + ' Rating: ' + '⭐'.repeat(Math.floor(data.rating == -1 ? 0 : data.rating)) + (data.rating > 0 ? ' ' : '') + rating[String(Math.round(data.rating))]);
  
  const buttonPrev = new client.component.Button()
    .setStyle('gray')
    .setLabel('Previous')
    .setEmoji('◀️')
    .setID('pokedexModule ability prev');
  const buttonNext = new client.component.Button()
    .setStyle('gray')
    .setLabel('Next')
    .setEmoji('▶️')
    .setID('pokedexModule ability next');
  const buttonRow = new client.component.ActionRow()
    .addComponents([buttonPrev, buttonNext]);
  
  if (message.reply) message.reply({embed: abilityEmbed}, [buttonRow])
  else client.editInteraction(message, [buttonRow], {embeds: [abilityEmbed]});
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: ['abil', 'abilities'],
}

exports.help = {
  name: "ability",
  shortDesc: "Display ability information.",
  desc: "Displays various information about the specified ability, such as effect and rating. Accepts ability id number argument.",
  usage: ["ability <ability name>"],
  example: ['ability lightning rod'],
}