const typechart = require('/app/data/typechart.js');

exports.rawCalc = (attacker, defender, move, field) => {
  /*
    object Pokemon:
      dex: type - object
      stats: 'statCalc.js'.calc
      level: type - number
  */
  
  // parse Internal Modifiers
  var modifiers = 1;
  if (attacker.dex.types.includes(move.type)) modifiers *= 1.5; // STAB
  
  // parse Other Modifiers
  var crit = 1;
  let critRoll = Math.floor(Math.random() * 16);
  if (critRoll == 0) crit = 1.5;
  let randomRoll = (85 + Math.floor(Math.random() * 16))/100;
  
  // parse Category
  let atk, def;
  if (move.category === "Physical") {
    atk = attacker.stats.atk;
    def = defender.stats.def;
  } else if (move.category === "Special") {
    atk = attacker.stats.spa;
    def = attacker.stats.spd;
  } else return 0;
  
  // calculate Type Effectiveness
  let typeEff = 1;
  defender.dex.types.forEach(t => {
    let iTypeEff = typechart[t.toLowerCase()].damageTaken[move.type];
    typeEff *= iTypeEff;
  });
  
  // parse Other Variables
  let power = move.basePower;
  if (!power || power == 0 || power == 1) return 0;
  
  let level = attacker.level || 100;
  
  // calculate Damage
  let dmg = (((((level*0.4) + 2)*power*(atk/def))/50) + 2)*typeEff*modifiers*crit*randomRoll;
  return {
    damage: Math.round(dmg) || 1,
    typeEff,
    crit,
  }
}