const typeMatchups = require("../data/typechart.js");

const sprites = require('/app/util/dex/spriteLoader.js');
const { pokeParser } = require('/app/commands/pokedex.js');
const embedColours = require('/app/util/embedColors.js').typeColors;

const capFL = (string) => string.charAt(0).toUpperCase() + string.slice(1);

exports.slash = {
  disabled: false,
  options: [
    { 
      type: 3, 
      required: true,
      name: "argument", 
      description: "Specify pokemon types or species name."
    }
  ],
}

exports.run = (client, message) => {
  if (!message.args.length) {
    const chartEmbed = new client.embed()
      .setTitle('Pokemon Type Chart')
      .setImage('https://cdn.glitch.global/8e812b32-a686-4403-9179-5932b89c1620/Pokemon_Type_Chart.svg.png?v=1690876464462')
      .setColor(client.config.color)
      .setFooter('Type ' + client.config.prefix + this.help.usage[0] + ' to get effectiveness a specific type combination.');
    return message.reply({embed: chartEmbed});
  }
  
  let def = {
    vulnCheck: false,
    normalCheck: false,
    resistCheck: false,
    noCheck: false,
    vulnTypes: [], 
    normalTypes: [],
    resistTypes: [], 
    noTypes: [],
    vulnDisplay: [], 
    vulnRaw: [], 
    normalRaw: [],
    resistRaw: [], 
    noRaw: [],
    multi: {
      Bug: 1, Dark: 1, Dragon: 1,
      Electric: 1, Fairy: 1, Fighting: 1,
      Fire: 1, Flying: 1, Ghost: 1,
      Grass: 1, Ground: 1, Ice: 1,
      Normal: 1, Poison: 1, Psychic: 1,
      Rock: 1, Steel: 1, Water: 1,
    },
  };
  let atk = {
    vulnCheck: false,
    normalCheck: false,
    resistCheck: false,
    noCheck: false,
    vulnTypes: [], 
    normalTypes: [],
    resistTypes: [], 
    noTypes: [],
    vulnDisplay: [], 
    vulnRaw: [], 
    normalRaw: [],
    resistRaw: [], 
    noRaw: [],
    multi: {
      Bug: 1, Dark: 1, Dragon: 1,
      Electric: 1, Fairy: 1, Fighting: 1,
      Fire: 1, Flying: 1, Ghost: 1,
      Grass: 1, Ground: 1, Ice: 1,
      Normal: 1, Poison: 1, Psychic: 1,
      Rock: 1, Steel: 1, Water: 1,
    },
  };
  let args = message.args.join(" ").toLowerCase();
  var displayTypes = [];
  
  // parse pokemon
  let dex = pokeParser(message);
  if (dex) args = dex.types.join(' ').toLowerCase();
  
  // parse types
  for (var z = 0; z < args.split(" ").length; z++) {
    var argsSplit = args.split(" ")[z];
    if (Object.keys(typeMatchups).map((c) => c.toLowerCase()).indexOf(argsSplit.toLowerCase()) != -1) {
      var toType = argsSplit;
      displayTypes.push(toType);
      var dTaken = typeMatchups[toType].damageTaken;

      for (let toMatch in dTaken) {
        if (def.multi[toMatch]) {
          if (dTaken[toMatch] == 1) {
            def.multi[toMatch] *= 2;
          } else if (dTaken[toMatch] == 2) {
            def.multi[toMatch] *= 0.5;
          } else if (dTaken[toMatch] == 3) {
            def.multi[toMatch] = 0;
          }
        }
      }

      for (let type in typeMatchups) {
        let toMatch = capFL(type);
        let ToType = capFL(toType);
        if (atk.multi[toMatch]) {
          if (typeMatchups[type].damageTaken[ToType] == 1) {
            atk.multi[toMatch] *= 2;
          } else if (typeMatchups[type].damageTaken[ToType] == 2) {
            atk.multi[toMatch] *= 0.5;
          } else if (typeMatchups[type].damageTaken[ToType] == 3) {
            atk.multi[toMatch] *= 0;
          }
        }
      }

      for (let i = 0; i < Object.keys(def.multi).length; i++) {
        if (def.multi[Object.keys(def.multi)[i]] > 1) {
          def.vulnCheck = true;

          break;
        }
      }

      for (let i = 0; i < Object.keys(def.multi).length; i++) {
        if (def.multi[Object.keys(def.multi)[i]] == 1) {
          def.normalCheck = true;

          break;
        }
      }

      for (let i = 0; i < Object.keys(def.multi).length; i++) {
        if (
          def.multi[Object.keys(def.multi)[i]] > 0 &&
          def.multi[Object.keys(def.multi)[i]] < 1
        ) {
          def.resistCheck = true;

          break;
        }
      }

      for (let i = 0; i < Object.keys(def.multi).length; i++) {
        if (def.multi[Object.keys(def.multi)[i]] === 0) {
          def.noCheck = true;

          break;
        }
      }

      for (let i = 0; i < Object.keys(atk.multi).length; i++) {
        if (atk.multi[Object.keys(atk.multi)[i]] > 1) {
          atk.vulnCheck = true;

          break;
        }
      }

      for (let i = 0; i < Object.keys(atk.multi).length; i++) {
        if (atk.multi[Object.keys(atk.multi)[i]] == 1) {
          atk.normalCheck = true;

          break;
        }
      }

      for (let i = 0; i < Object.keys(atk.multi).length; i++) {
        if (
          atk.multi[Object.keys(atk.multi)[i]] > 0 &&
          atk.multi[Object.keys(atk.multi)[i]] < 1
        ) {
          atk.resistCheck = true;

          break;
        }
      }

      for (let i = 0; i < Object.keys(atk.multi).length; i++) {
        if (atk.multi[Object.keys(atk.multi)[i]] === 0) {
          atk.noCheck = true;

          break;
        }
      }
    }
  }

  if (def.vulnCheck) {
    for (let i = 0; i < Object.keys(def.multi).length; i++) {
      if (
        def.multi[Object.keys(def.multi)[i]] > 1 &&
        def.vulnRaw.indexOf(Object.keys(def.multi)[i]) == -1
      ) {
        def.vulnTypes.push(
          Object.keys(def.multi)[i] +
            " (x" +
            def.multi[Object.keys(def.multi)[i]] +
            ")"
        );

        def.vulnRaw.push(Object.keys(def.multi)[i]);
      }
    }

    def.vulnDisplay[0] = "Vulnerable to: " + def.vulnTypes.join(", ");
  }

  if (def.normalCheck) {
    for (let i = 0; i < Object.keys(def.multi).length; i++) {
      if (
        def.multi[Object.keys(def.multi)[i]] == 1 &&
        def.normalRaw.indexOf(Object.keys(def.multi)[i]) == -1
      ) {
        def.normalTypes.push(Object.keys(def.multi)[i]);

        def.normalRaw.push(Object.keys(def.multi)[i]);
      }
    }

    def.vulnDisplay[1] =
      "Takes normal damage from: " + def.normalTypes.join(", ");
  }

  if (def.resistCheck) {
    for (let i = 0; i < Object.keys(def.multi).length; i++) {
      if (
        def.multi[Object.keys(def.multi)[i]] > 0 &&
        def.multi[Object.keys(def.multi)[i]] < 1 &&
        def.resistRaw.indexOf(Object.keys(def.multi)[i]) == -1
      ) {
        def.resistTypes.push(
          Object.keys(def.multi)[i] +
            " (x" +
            def.multi[Object.keys(def.multi)[i]] +
            ")"
        );

        def.resistRaw.push(Object.keys(def.multi)[i]);
      }
    }

    def.vulnDisplay[2] = "Resists: " + def.resistTypes.join(", ");
  }

  if (def.noCheck) {
    for (let i = 0; i < Object.keys(def.multi).length; i++) {
      if (
        def.multi[Object.keys(def.multi)[i]] === 0 &&
        def.noRaw.indexOf(Object.keys(def.multi)[i]) == -1
      ) {
        def.noTypes.push(Object.keys(def.multi)[i]);

        def.noRaw.push(Object.keys(def.multi)[i]);
      }
    }

    def.vulnDisplay[3] = "Not affected by: " + def.noTypes.join(", ");
  }

  if (atk.vulnCheck) {
    for (let i = 0; i < Object.keys(atk.multi).length; i++) {
      if (
        atk.multi[Object.keys(atk.multi)[i]] > 1 &&
        atk.vulnRaw.indexOf(Object.keys(atk.multi)[i]) == -1
      ) {
        atk.vulnTypes.push(
          Object.keys(atk.multi)[i] +
            " (x" +
            atk.multi[Object.keys(atk.multi)[i]] +
            ")"
        );

        atk.vulnRaw.push(Object.keys(atk.multi)[i]);
      }
    }

    atk.vulnDisplay[0] = "Supereffective against: " + atk.vulnTypes.join(", ");
  }

  if (atk.normalCheck) {
    for (let i = 0; i < Object.keys(atk.multi).length; i++) {
      if (
        atk.multi[Object.keys(atk.multi)[i]] == 1 &&
        atk.normalRaw.indexOf(Object.keys(atk.multi)[i]) == -1
      ) {
        atk.normalTypes.push(Object.keys(atk.multi)[i]);

        atk.normalRaw.push(Object.keys(atk.multi)[i]);
      }
    }

    atk.vulnDisplay[1] =
      "Deals normal damage to: " + atk.normalTypes.join(", ");
  }

  if (atk.resistCheck) {
    for (let i = 0; i < Object.keys(atk.multi).length; i++) {
      if (
        atk.multi[Object.keys(atk.multi)[i]] > 0 &&
        atk.multi[Object.keys(atk.multi)[i]] < 1 &&
        atk.resistRaw.indexOf(Object.keys(atk.multi)[i]) == -1
      ) {
        atk.resistTypes.push(
          Object.keys(atk.multi)[i] +
            " (x" +
            atk.multi[Object.keys(atk.multi)[i]] +
            ")"
        );

        atk.resistRaw.push(Object.keys(atk.multi)[i]);
      }
    }

    atk.vulnDisplay[2] =
      "Not very effective against: " + atk.resistTypes.join(", ");
  }

  if (atk.noCheck) {
    for (let i = 0; i < Object.keys(atk.multi).length; i++) {
      if (
        atk.multi[Object.keys(atk.multi)[i]] === 0 &&
        atk.noRaw.indexOf(Object.keys(atk.multi)[i]) == -1
      ) {
        atk.noTypes.push(Object.keys(atk.multi)[i]);

        atk.noRaw.push(Object.keys(atk.multi)[i]);
      }
    }

    atk.vulnDisplay[3] = "Doesn't affect: " + atk.noTypes.join(", ");
  }

  if (!displayTypes[0]) return message.reply("> Invalid types specified.");
  let types = [];
  displayTypes.forEach(t => types.push(capFL(t)));
  let imgs = sprites.type(types[0]);
  const embed = new client.embed()
    .setColor(embedColours[types[0]])
    .setTitle(types.join(" / "))
    .addField("Offense", atk.vulnDisplay.join("\n\n"))
    .addField("Defense", def.vulnDisplay.join("\n\n"));
  if (types.length == 1) {
    embed.setThumbnail(imgs.tera);
    let immunities = [],
        damage = typeMatchups[displayTypes[0]].damageTaken;
    otherSources.forEach(data => {
      if (damage[data.id] == 3) immunities.push(data.name);
    });
    if (immunities[0]) embed.setFooter('Immune to: ' + immunities.join(', '))
  }
  if (dex) {
    let pokespr = sprites.pokemon(dex);
    embed.setAuthor(dex.name, pokespr.icon);
    if (types.length > 1) embed.setThumbnail(pokespr.dex);
  }

  message.reply({embed});
};

exports.conf = {
  module: 1,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: ['weak', 'types'],
}

exports.help = {
  name: "type",
  shortDesc: "Display type(s) effectiveness. Accepts pokemon name as argument.",
  desc: "Displays combined type effectiveness chart of all the specified type(s) or the types of the specified pokemon. Sends full type chart image if no argument is specified.",
  usage: ["type [type1] [type2] ...", "type [pokemon name]"],
  example: ['type rock', 'type fire fighting', 'type charizard'],
}

const otherSources  = [
  { id: 'prankster', name: 'Prankster', },
  { id: 'par', name: 'Paralysis', },
  { id: 'brn', name: 'Burn', },
  { id: 'trapped', name: 'Trapping Abilities', },
  { id: 'powder', name: 'Powder Moves', },
  { id: 'sandstorm', name: 'Sandstorm', },
  { id: 'hail', name: 'Hail', },
  { id: 'frz', name: 'Freeze', },
  { id: 'psn', name: 'Poison', },
]

// recycled 
