exports.rawCalc = (stat, base, level, iv, ev, nature) => {
  // min: 0, 0, 0.9
  // max: 31, 252, 1.1
  if (!level) level = 100;
  if (!iv) iv = 0;
  if (!ev) ev = 0;
  if (!nature) nature = 1;
  
  if (stat === "hp") {
    if (base === 1) return 1; // Shedinja
    return Math.floor((((2 * base + iv + (ev/4)) * level) / 100) + level + 10);
  }
  else return Math.floor(((((2 * base + iv + (ev/4)) * level) / 100) + 5) * nature);
}

exports.calc = (dex, options) => {
  if (!options) options = {};
  let output = {};
  stats.forEach(s => {
    output[s] = this.rawCalc(s, dex.baseStats[s], options.level, options.ivs ? options.ivs[s] : null, options.evs ? options.evs[s] : null, options.nature);
  });
  return output;
}

const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];