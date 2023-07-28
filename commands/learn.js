const termify = (name) => {
  let term = name.toLowerCase().replace(/-/g, '').replace(/ /g, '').replace(/'/g, '').replace(/’/g, '').replace('.', '');
  return term;
}
const learnParser = (string) => {
  let gen = string[0], met = string[1],
      args = string.slice(2).split(':')[0],
      prevo = string.split(':')[1];
  var method, eventgen;
  
  switch(met) {
    case "L":
      method = "At Level " + args;
      if (args == 0) method = "On Evolution";
      break;
      
    case "M":
      if (gen == 8) method = "By using TM/TR";
      else if (gen > 6) method = "By using TM";
      else method = "By using TM/HM";
      break;
      
    case "T":
      method = "From Move Tutor";
      break;
      
    case "E":
      method = "As Egg Move";
      break;
      
    case "V":
      if (gen == 7) method = "From Virtual Console";
      if (gen == 8) method = "From Pokemon Let's Go";
      break;
      
    case "S":
      eventgen = gen;
      method = 'Event Distribution';
      break;
      
    case "D":
      method = 'From Dream World'
      break;
  }
  let msg = method || met + args;
  if (prevo) msg = prevo + ': ' + msg;
  var text = 'Gen ' + gen + ': ' + msg;
  return { text, eventgen };
}

const embedColours = {
    Red: 16724530,
    Blue: 2456831,
}

const pokedex = require('/app/data/pokedex.js');
const { Moves } = require('/app/data/moves.js');
const { Items } = require('/app/data/items.js');
const learnsets = require('/app/data/learnsets.js');
const sprites = require('/app/util/spriteLoader.js').pokemon;
const { pokeParser } = require('/app/commands/pokedex.js');

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
      type: 3,
      required: false,
      name: "move",
      description: "Specify pokemon move name."
    }
  ],
}

exports.run = (client, message) => {
  let params = message.args.join(' ').split(',');
  if (!params[0]) params[0] = '';
  var args = params[0].split(' ');
  
  let dex = pokeParser(message, args, false);
  
  const PokemonData = learnsets[termify(dex.name)];
  if (!PokemonData) return message.reply("> No moveset found.");
  let { learnset, eventData } = PokemonData;
  learnset = prevoParser(learnset, dex);
  let param = params[1];
  if (param) {
    param = param.toLowerCase().replace(/ /g, '').replace(/'/g, '').replace(/-/g, '').replace('gigantamax', 'gmax');
    let move = Moves[param];
    if (!move) return message.reply("> Invalid move specified.");
    let data = learnset[termify(move.name)],
        spr = sprites(dex);
    const learnEmbed = new client.embed()
      .setTitle(dex.name)
      .setThumbnail(spr.dex)
      .setFooter('Type "' + client.config.prefix + this.help.name + ' ' + dex.name.toLowerCase().replace(/-/g, ' ') + '" to view all learnable moves.', spr.icon);
    if (!data) {
      learnEmbed
        .setColor(embedColours.Red)
        .setDescription(dex.name + ' CANNOT learn the move ' + move.name);
    } else {
      let methods = [],
          evented = [];
      data.forEach(m => {
        let parsed = learnParser(m, eventData);
        if (evented.includes(parsed.eventgen)) return;
        else if (parsed.eventgen) evented.push(parsed.eventgen);
        methods.push(parsed.text);
      });
      let cleanMethods = {};
      methods.forEach(m => {
        let genm = cleanMethods[m[4]] || [];
        genm.push(m.slice(7));
        cleanMethods[m[4]] = genm;
      });
      learnEmbed
        .setColor(embedColours.Blue)
        .setDescription(dex.name + ' CAN learn the move ' + move.name)
        // .addField('Methods', methods.join('\n'));
      Object.keys(cleanMethods)
      .forEach(m => {
        learnEmbed.addField('Generation ' + m, cleanMethods[m].join('\n'));
      });
    }
    message.reply({embed: learnEmbed});
  } else {
    // start interactions
    let introgen = genIdentifier(dex);
    let genarray = [9];
    if (introgen < 9) genarray.push(8);
    if (introgen < 8) genarray.push(7);
    if (introgen < 7) genarray.push(6);
    if (introgen < 6) genarray.push(5);
    if (introgen < 5) genarray.push(4);
    if (introgen < 4) genarray.push(3);
    const genMenu = new client.component.Menu()
      .setPlaceholder("Select Generation")
      .setID("learn genMenu:" + termify(dex.name));
    genarray.forEach(g => {
      let genOption = new client.component.MenuOption()
        .setLabel("Generation " + g)
        .setValue(g)
        .setEmoji(genEmoji[g]);
      genMenu.addOption(genOption);
    });
    const methodMenu = new client.component.Menu()
      .setPlaceholder("Select Method")
      .setID("learn methodMenu:" + termify(dex.name));
    Object.keys(methods).forEach(m => {
      let mdata = methods[m];
      const metOption = new client.component.MenuOption()
        .setLabel(mdata.title)
        .setValue(m)
        .setEmoji(mdata.emoji);
      methodMenu.addOption(metOption);
    });
    const row1 = new client.component.ActionRow()
      .addComponent(genMenu);
    const row2 = new client.component.ActionRow()
      .addComponent(methodMenu);
    
    // make embed
    var defaultID = "9L";
    let learnarray = learnables(defaultID, learnset, eventData);
    let learnEmbed = makeEmbed(client, learnarray, dex, defaultID);
    message.reply({embed: learnEmbed}, [row1, row2]);
  }
}

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: [ 'moveset' ]
}

exports.help = {
  name: "learn",
  shortDesc: "Show pokemon's full learnset or check a particular move's compatability.",
  desc: "Displays all of specified pokemon's learnable moves if used without a specified move. If a move is specified, lists the various methods the pokemon can learn that move.",
  usage: "learn <pokemon name> , [move name]",
  example: [ "learn charizard" , "learn pikachu, fake out" ]
}

exports.continueInteraction = (client, interaction) => {
  let id = ["", "L"],
      value = interaction.data.values[0],
      custid = interaction.data.custom_id,
      poke = custid.split(':')[1],
      embed = interaction.message.embeds[0];
 if (custid.startsWith("learn methodMenu")) {
    let footer = embed.footer.text.split(':')[0].split(' ')[1];
    id[1] = value;
    id[0] = footer;
  }
  if (custid.startsWith("learn genMenu")) id[0] = value;
  
  const dex = pokedex[poke];
  const { learnset, eventData } = learnsets[poke];
  
  
  let learnarray = learnables(id.join(''), learnset, eventData);
  let learnEmbed = makeEmbed(client, learnarray, dex, id.join(""));
  client.editInteraction(interaction, null, {embeds: [learnEmbed]});
}

const learnables = (id, learnset, eventData) => {
  let learnarray = [];
  if (id[1] == "S") {
    if (!eventData) return eventData;
    let raw = [], text = [];
    eventData.forEach(e => {
      if (e.generation == id[0]) raw.push(e);
    });
    raw.forEach(e => {
      let lines = [];
      let line = 'Level ' + e.level;
      if (e.gender) line += ' ' + genEmoji[e.gender];
      if (e.shiny) line += ' 🌟';
      if (e.pokeball) line += ' [**' + Items[e.pokeball].name + '**]';
      lines.push('> ' + line);
      if (e.nature) lines.push('> ' + e.nature + ' Nature')
      if (e.ivs) {
        let ivs = [];
        Object.keys(e.ivs).forEach(s=>{
          ivs.push(e.ivs[s] + ' ' + s.toUpperCase());
        });
        lines.push('> IVs: ' + ivs.join(', '));
      }
      let moves = [];
      e.moves.forEach(m => {
        moves.push(Moves[m].name);
      });
      lines.push('> **Moves:** ' + moves.join(', '));
      text.push(lines.join('\n'));
    });
    return text;
  }
  else if (id[1] == "L") {
    let datalist = {};
    Object.keys(learnset).forEach(move => {
      let data = learnset[move];
      data.forEach(m => {
        if (m.startsWith(id)) {
          let lvl = m.slice(2);
          let moves = datalist[lvl] || [];
          moves.push(Moves[move].name);
          datalist[lvl] = moves;
        }
      });
    });
    Object.keys(datalist).forEach(d => {
      let lvl = d,
          moves = datalist[d];
      if (lvl == 0) lvl = "Evo"
      switch (lvl.length) {
        case 1:
          lvl += "   ";
          break;
        case 2:
          lvl += "  ";
          break;
        case 3:
          lvl += " ";
          break;
      }
      moves.forEach(move => {
        if (!lvl.includes(':')) learnarray.push(lvl + "  " + move);
      });
    });
  }
  else {
    Object.keys(learnset).forEach(move => {
      let data = learnset[move];
      data.forEach(m => {
        if (m.startsWith(id)) learnarray.push(Moves[move].name);
      });
    });
  }
  return learnarray;
}

const makeEmbed = (client, learnarray, dex, id) => {
  if (!learnarray) learnarray = [];
  let bool = (id[1] == "L");
  let description = (learnarray.length) ? '```' + (bool ? "Lv    Move\n\n" : "\n") + learnarray.join('\n') + '```' : methods[id[1]].error(id[0]);
  description = description.replace('Generation 8', 'Pokemon Sword/Shield');
  if (id[1] == "S" && learnarray.length) description = learnarray.join("\n\n");
  let spr = sprites(dex);
  const learnEmbed = new client.embed()
    .setColor(methods[id[1]].color)
    .setThumbnail(spr.dex)
    .setAuthor(dex.name, spr.icon)
    .setTitle(methods[id[1]].title)
    .setFooter('Generation ' + id[0] + ': ' + methods[id[1]].title)
    .setDescription(description);
  return learnEmbed;
}

const genIdentifier = (data) => {
  let { num } = data;
  if (num <= 151) return 1;
  else if (num <= 251) return 2;
  else if (num <= 386) return 3;
  else if (num <= 493) return 4;
  else if (num <= 649) return 5;
  else if (num <= 721) return 6;
  else if (num <= 809) return 7;
  else if (num <= 905) return 8;
  else return 9;
}

var parsed = [];
const prevoParser = (learnset, dex) => {
  if (parsed.includes(dex.name)) return learnset;
  parsed.push(dex.name);
  let { prevo } = dex;
  if (!prevo) return learnset;
  let prevo_dex = pokedex[termify(prevo)];
  let prevo_learnset = learnsets[termify(prevo)].learnset;
  Object.keys(prevo_learnset)
    .forEach(move => {
      let data = learnset[move] || [];
      let prevo_data = prevo_learnset[move];
      prevo_data.forEach(m => {
        if (!data.includes(m)) data.push(m + ':' + prevo);
      });
    learnset[move] = data;
  });
  
  let prepre = prevo_dex.prevo;
  if (!prepre) return learnset;
  let prepre_dex = pokedex[termify(prepre)];
  let prepre_learnset = learnsets[termify(prepre)].learnset;
  Object.keys(prepre_learnset)
    .forEach(move => {
      let data = learnset[move] || [];
      let prepre_data = prepre_learnset[move];
      prepre_data.forEach(m => {
        if (!data.includes(m)) data.push(m + ':' + prepre);
      });
    learnset[move] = data;
  });
  return learnset;
}

const genEmoji = {
  "1": "1️⃣", "2": "2️⃣", "3": "3️⃣",
  "4": "4️⃣", "5": "5️⃣", "6": "6️⃣",
  "7": "7️⃣", "8": "8️⃣", "9": "9️⃣",
  M: "♂️", F: "♀️"
}
const methods = {
  L: {
    name: "Level", emoji: "🆙", 
    title: "Level-Up Moveset",
    error: (g) => "This pokemon does not exist in Generation " + g + ".",
    color: 15844367,
  },
  E: {
    name: "Egg", emoji: "🥚", 
    title: "Egg Moves",
    error: (g) => "This pokemon does not learn any egg moves in Generation " + g + ".",
    color: 14803425,
  },
  M: {
    name: "TM", emoji: "💿",
    title: "TMs/TRs/HMs",
    error: () => "No TMs found.",
    color: 9868950,
  },
  T: {
    name: "Tutor", emoji: "👨‍🏫",
    title: "Move Tutors",
    error: () => "No tutor moves found.",
    color: 4128590,
  },
  S: {
    name: "Event", emoji: "🎁",
    title: "Event Moves",
    error: () => "No event distributions found.",
    color: 3447003,
  }
}