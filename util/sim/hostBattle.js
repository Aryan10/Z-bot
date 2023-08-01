const fs = require('fs');

exports.startBattle = (client, message, params) => {
  /* 
    object params:
      battle_id: 
      format: 
      useLabels: 'vanilla' / 'showdown'
      p1: object Player
      p2: object Player
    
    object Player:
      id: string
      team: array
      items: array || object
  */
  let rec = require('./recBattle.json');
  
  let pushObj = rec[params.battle_id] || params;
  pushObj.turn = 1; // 0 for ponkemon selection || team preview, handle through seperate function
  pushObj.activeMon = {p1: null, p2: null}
  pushObj.selection = {p1: null, p2: null};
  
  let labels = labelTypes[params.useLabels] || labelTypes.games;
  let formatData = formats[params.format] || formats.basic;
  
  let buttons = {};
  buttons.fight = new client.component.button()
    .setLabel(labels.fight)
    .setEmoji('⚔️')
    .setStyle('gray')
    .setID('battle fight ' + params.battle_id);
  buttons.bag = new client.component.button()
    .setLabel(labels.bag)
    .setEmoji('🎒')
    .setStyle('gray')
    .setID('battle pokemon ' + params.battle_id);
  buttons.pokemon = new client.component.button()
    .setLabel(labels.pokemon)
    .setEmoji('🐶')
    .setStyle('gray')
    .setID('battle pokemon ' + params.battle_id);
  buttons.run = new client.component.button()
    .setLabel(labels.run)
    .setEmoji('🔚')
    .setStyle('red')
    .setID('battle run ' + params.battle_id);
  const actionRow = new client.component.ActionRow()
    .addComponent(buttons.fight);
  if (formatData.useItems) actionRow.addComponent(buttons.bag);
  if (formatData.partySize > formatData.activeSize) actionRow.addComponent(buttons.pokemon);
  actionRow.addComponent(buttons.run);
  
  let p1poke = params.p1.team[0];
  let p2poke = params.p1.team[1];
}

const labelTypes = {
  games: {
    fight: "Fight",
    bag: "Bag",
    pokemon: "Pokemon",
    run: "Run",
  },
  showdown: {
    fight: "Attack",
    bag: "Item",
    pokemon: "Switch",
    run: "Forfeit"
  },
  pmd: {
    fight: "Moves",
    bag: "Items",
    pokemon: "Team",
    run: "Escape",
  }
}

const formats = {
  basic: {
    partySize: 1,
    activeSize: 1,
    useFirstSlot: true,
    teamPreview: false,
    useItems: false,
  }
}