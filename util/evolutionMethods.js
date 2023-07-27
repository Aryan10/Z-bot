const evolutionMethods = (pkmn) => {
  let textarray = [];
  switch (pkmn.evoType) {

    case undefined:
    if (pkmn.evoLevel) textarray.push("Level " + pkmn.evoLevel);
    break;
    
    case "useItem":
    textarray.push("Use " + pkmn.evoItem);
    break;
    
    case "trade":
    textarray.push("Trade");
    if (pkmn.evoItem) textarray.push("holding " + pkmn.evoItem)
    break;
    
    case "levelFriendship":
    textarray.push("Level up with atleast 220 Friendship");
    break;
      
    case "levelMove":
    textarray.push("Level up knowing " + pkmn.evoMove);
    break;
    
    case "levelHold":
    textarray.push("Level up holding " + pkmn.evoItem);
    break;
    
    case "levelExtra":
    textarray.push("Level up");
    break;
    
    case "other":
    break;
  }
  if (pkmn.evoCondition) textarray.push(pkmn.evoCondition);
  if (pkmn.evoRegion) textarray.push("in " + pkmn.evoRegion);
  return textarray.join(" ");
}

module.exports = evolutionMethods;