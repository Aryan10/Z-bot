const termify = (name) => {
  let term = name.toLowerCase().replace(/-/g, '').replace(/ /g, '').replace(/'/g, '').replace(/’/g, '').replace('.', '');
  return term;
}

const pokedex = require('/app/data/pokedex.js');
const evotext = require('/app/util/dex/evolutionMethods.js');
const pokemonList = Object.keys(pokedex);

const spriteLoader = require('/app/util/dex/spriteLoader.js').pokemon;
const embedColours = require('/app/util/embedColors.js').rawColors;

const Matcher = require('did-you-mean');
let match = new Matcher(pokemonList.join(' '));

var numObj = {};
pokemonList.forEach(name => {
  var { num } = pokedex[name];
  if (!numObj[num]) numObj[num] = name;
});

exports.pokeParser = (message, args, numberArray, randomArgument) => {
  if (!args) args = message.args;
  if (!args) args = [];
  if (!args[0]) args[0] = '';
  if (!args[1]) args[1] = '';
  if (!args[2]) args[2] = '';
  
  var data, isRand;
  if (randomArgument) {
    let term = args.join('').toLowerCase();
    if (term == 'r' || term.startsWith('rand')) {
      isRand = true;
      let randPoke = Math.floor(Math.random()*1010) + 1;
      args = [String(randPoke), "", ""];
    }
  }
  
  if (numberArray) {
    let num = args.join('');
    let name = numberArray[num];
    if (name) data = pokedex[name];
  }
  
  let poke = args.join('¤')
    .toLowerCase()
    .replace(/-/g, "")
    .replace('.', '')
    .replace("'", "")
    .replace("’", "")
    .replace("%", "")
    .replace("alolan", "alola")
    .replace("galarian", "galar")
    .replace("hisuian", "hisui")
    .replace("gigantamax", "gmax");
  args = poke.split("¤");
  poke = poke.replace("¤", "");
  
  if (!data) data = pokedex[poke];
  if (!data) data = pokedex[args[1] + args[0] + args[2]]; // mega charizard x
  if (!data) data = pokedex[args[2] + args[0] + args[1]]; // dusk mane necrozma
  if (!data) data = pokedex[args[1] + args[2] + args[0]]; // galarian mr. mime
  if (!data) data = pokedex[args[1] + args[0]]; // mega venusaur
  if (!data && message.args) data = pokedex[termify(message.args[0])];
  if (isRand) data.fromRandomArgument = true;
  return data;
}

exports.slash = {
  disabled: false,
  options: [
    { 
      type: 3, 
      required: true,
      name: "pokemon", 
      description: "Specify pokemon name."
    }
  ],
}

exports.run = (client, message, caller_id) => {
  var { args } = message;
  if (caller_id) {
    let embed = message.message.embeds[0];
    var number = Number(embed.author.name.slice(1).split(' ')[0]);
    if (caller_id == "prev") args = [String(number - 1)];
    if (caller_id == "next") args = [String(number + 1)];
    if (caller_id == "rand") args = ["rand"];
  }
  
  let data = this.pokeParser(message, args, numObj, true);
  
  let error_content = "> No Pokemon found.";
  if (!data || data.isNonstandard === "CAP") {
    let dym = match.get(message.args.join(" "));
    if (dym) error_content += "\n> Did you mean `" + dym + "`?";
    if (message.reply) return message.reply(error_content);
    else return client.replyInteraction(message, null, {content: error_content, flags: 64});
  }
  if (data.num < 1 && !message.reply) return client.replyInteraction(message, null, {content: error_content, flags: 64});
  
  // // Organise Information
  
  // types
  let type_key = (data.types.length == 1 ? "Type" : "Types");
  let type_value = data.types.join(" / ");
  
  // abilities
  let keys = Object.keys(data.abilities);
  let ability_key = (keys.length == 1 ? "Ability" : "Abilities");
  let ability_array = [];
  keys.forEach(i => {
    let j = data.abilities[i];
    if (i == "H") ability_array.push("*" + j + "*")
    else if (i == "S") ability_array.push("***" + j + "***")
    else ability_array.push(j);
  });
  let ability_value = ability_array.join(", ");
  
  // evolution
  let evodata = [];
  let prevodata, postevodata, prepre, postpost;
  if (data.prevo) {
    prevodata = pokedex[termify(data.prevo)];
    if (prevodata.prevo) {
      prepre = pokedex[termify(prevodata.prevo)];
      evodata.push(prevodata.prevo);
    }
    evodata.push(data.prevo);
  }
  evodata.push(data.name);
  let altevos = [];
  if (data.evos) {
    evodata.push(data.evos[0]);
    altevos = data.evos.slice(1);
    postevodata = pokedex[termify(data.evos[0])];
    if (postevodata.evos) {
      evodata.push(postevodata.evos[0]);
      altevos = postevodata.evos.slice(1);
      postpost = pokedex[termify(postevodata.evos[0])];
    }
  }
  let evostrarray = [];
  evostrarray.push("▪︎ **" + evodata[0] + "**");
  let basedata, evoM1data, evoM2data;
  if (prepre) {
    basedata = prepre;
    evoM1data = prevodata;
    evoM2data = data;
  }
  else if (prevodata) {
    basedata = prevodata;
    evoM1data = data;
    evoM2data = postevodata;
  }
  else if (postevodata) {
    basedata = postevodata;
    evoM1data = postevodata;
    evoM2data = postpost;
  }
  if (evoM1data) {
    let evoM1 = evotext(evoM1data);
    evostrarray.push(evoM1);
    evostrarray.push(`▪︎▪︎ **${evodata[1]}**`);
    if (evoM2data) {
      let evoM2 = evotext(evoM2data);
      evostrarray.push(evoM2);
      evostrarray.push(`▪︎▪︎▪︎ **${evodata[2]}**`);
    }
  }
  altevos.forEach(d => {
    evostrarray.push (evotext(pokedex[termify(d)]));
    evostrarray.push( '▪︎'.repeat(evodata.length) + " **" + d + "**");
  });
  let evostring = evostrarray.join("\n");
  
  // formes
  let formes = data.otherFormes,
      baseform = data.baseSpecies || data.changesFrom,
      basereq = data.requiredItem;
  if (!basereq && data.forme === 'Gmax') basereq = pokedex[termify(baseform)].canGigantamax;
  if (basereq) baseform += " (" + basereq + ")";
  
  // tags
  let footer;
  let footArray = data.tags || [];
  if (data.canGigantamax) footArray.push('Can Gigantamax');
  if (data.isMega) footArray.push('Mega Evolution');
  if (footArray.length) footer = 'Tags: ' + footArray.join(', ');
  
  // base stats
  let basestats = [];
  Object.keys(data.baseStats).forEach(k => {
    let val = data.baseStats[k];
    basestats.push(k.toUpperCase() + ": **" + val + "**");
  });
  let stats = Object.values(data.baseStats);
  let total = 0;
  stats.forEach(i => total += i);
  let bststring = basestats.join(", ");
  
  // gender
  let genderinfo = "50% M | 50% F"
  if (data.gender === "N") genderinfo = "Genderless";
  if (data.gender === "M") genderinfo = "100% Male";
  if (data.gender === "F") genderinfo = "100% Female";
  if (data.genderRatio) genderinfo = `${100*data.genderRatio.M}% Male | ${100*data.genderRatio.F}% Female`;
  let info = `Height: **${data.heightm} m**\nWeight: **${data.weightkg} kg**\nEgg Groups: **${data.eggGroups.join(", ")}**\nGender Ratio: **${genderinfo}**`;
  
  // // Craft Message
  let spr = spriteLoader(data);
  
  const buttonPrev = new client.component.Button()
    .setStyle('gray')
    .setLabel('Previous')
    .setEmoji('◀️')
    .setID('pokedexModule pokedex prev');
  const buttonNext = new client.component.Button()
    .setStyle('gray')
    .setLabel('Next')
    .setEmoji('▶️')
    .setID('pokedexModule pokedex next');
  const buttonRand = new client.component.Button()
    .setStyle('primary')
    .setLabel('Random')
    .setEmoji('🎲')
    .setID('pokedexModule pokedex rand');
  const buttonRow = new client.component.ActionRow()
    .setComponents([buttonPrev, buttonNext]);
  if (data.fromRandomArgument) buttonRow.addComponent(buttonRand);
  const pokeEmbed = new client.embed()
    .setAuthor('#' + data.num, spr.icon)
    .setTitle(data.name)
    .addField(type_key, type_value, true)
    .addField(ability_key, ability_value || "No Ability", true)
    .addField("Base Stats (TOTAL: " + total + ")", bststring)
    .addField("Evolution Data", evostring);
  if (formes) pokeEmbed.addField(
    'Other Formes', formes.join(', '));
  if (baseform) pokeEmbed.addField(
    'Base Species', baseform);
  pokeEmbed
    .addField("Other Information", info)
    .setColor(
      embedColours[data.color])
    .setThumbnail(spr.dex)
    .setImage(spr.ani);
  if (footer) pokeEmbed.setFooter(footer);
  if (message.reply) message.reply({embed: pokeEmbed}, [buttonRow]);
  else client.editInteraction(message, [buttonRow], {embeds: [pokeEmbed]});
  // To Long-Term Add - Dex Entry, Smogon Tier
  // Potentially Add - Command Menu: Type: Water/Dark, Ability: Torrent, Ability, Protean, Ability: Battle Bond, Pokemon: Froakie, Pokemon: Frogadier, Pokemon: Greninja, Pokemon: Greninja-Bond, Pokemon: Greninja-Ash
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: ['dex', 'pokemon'],
}

exports.help = {
  name: "pokedex",
  shortDesc: "Displays pokemon information.",
  desc: "Displays various pokedex information about the specified pokemon forme or pokemon national dex number, such as image, base stats, evolutionary line etc. Corrects wrong pokemon name. Specify argument `random` to get random pokemon instead.",
  usage: ["pokedex <pokemon name>", "pokedex <pokemon id>", "pokedex random"],
  example: ["pokedex pikachu", "pokedex alolan raichu", "pokedex mega charizard x", "pokedex 25"],
}