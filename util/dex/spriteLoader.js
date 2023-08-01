exports.pokemon = (data, custom) => {
  let namekey = data.name.toLowerCase().replace(/ /g, '').replace(/'/g, '').replace(/’/g, '').replace('.', '');
  let namearray = namekey.split('-');
  if (namearray.length > 1) namekey = namearray[0] + '-' + namearray.slice(1).join('');
  let domain = 'https://play.pokemonshowdown.com/sprites/';
  let returnobj = {
    dex: domain + 'dex/' + namekey + '.png',
    ani: domain + 'ani/' + namekey + '.gif',
    icon: domain + 'gen5icons/' + data.num + '.png',
    custom: domain + custom
  }
  return returnobj;
}

exports.type = (type) => {
  let site = 'https://play.pokemonshowdown.com/sprites/types/';
  return {
    type: site + type + '.png',
    tera: site + 'Tera' + type + '.png'
  }
}