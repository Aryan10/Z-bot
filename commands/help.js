const modules = require('/app/util/modules.js');

exports.slash = {
  disabled: false,
  options: [
    { 
      type: 3, 
      name: "command", 
      description: "Get detailed info on a particular command."
    }
  ],
}

exports.conf = {
  module: 0,
  disabled: false,
  ownerOnly: false,
  guildOnly: false,
  aliases: ['h', 'commands'],
}

exports.help = {
  name: "help",
  shortDesc: "Displays list of commands or command info.",
  desc: "Displays avaliable modules and list of commands. If command name is specified, displays information about that command, such as usage and example.",
  usage: "help [command name]",
  example: ["help", "help dex"],
}

exports.run = (client, message) => {
  let { prefix } = client.config,
      { authorIsOwner } = client;
  if (message.args[0]) {
    let args = message.args.join('');
    let cmd = client.commands.get(args);
    if (!cmd) cmd = client.commands.get(client.aliases.get(args));
    if (!cmd || cmd.conf.disabled) return message.reply("> Command not found.");
    let desc = cmd.help.desc || cmd.help.shortDesc;
    let slashEnabled = cmd.slash && !cmd.slash.disabled;
    if (cmd.conf.ownerOnly) desc += "\n**Bot Owner Only**";
    const cmdHelp = new client.embed()
      .setColor(3447003)
      .setTitle(prefix + cmd.help.name)
      .setDescription(desc);
    if (cmd.conf.aliases && cmd.conf.aliases.length) cmdHelp.addField('Aliases', cmd.conf.aliases.join(', '));
    cmdHelp
      .addField('Usage', cmd.help.usage ? '**' + prefix + cmd.help.usage + '**' : '**' + prefix + cmd.help.name + '**')
      .addField('Example', (cmd.help.example && cmd.help.example.length) ? '`' + prefix + cmd.help.example.join('`\n`' + prefix) + '`' : '`' + prefix + cmd.help.name + '`')
      .setAuthor('Module: ' + modules[cmd.conf.module].name, client.user.avatarURL);
    if (slashEnabled) cmdHelp.setFooter('✅️ Slash Command: /' + cmd.help.name);
    return message.reply({embed: cmdHelp});
  } else {
    const menu = new client.component.Menu()
      .setPlaceholder("Select Command Module")
      .setID('help');
    modules.forEach(m => {
      const option = new client.component.MenuOption()
        .setLabel(m.name)
        .setValue(m.num)
        .setDescription(m.desc);
      menu.addOption(option);
    });
    this.startInteraction(client, message, menu);
  }
}

exports.startInteraction = (client, message, menu) => {
  let owners = [];
  client.config.botOwners.forEach(o => owners.push('<@' + o + '>'));
	const aboutEmbed = new client.embed()
	  .setColor(3447003)
	  .setAuthor(client.user.username + '#' + client.user.discriminator, client.user.avatarURL)
    .setThumbnail(
      client.user.avatarURL)
    .setDescription(
      `${client.user.mention} is a WIP discord bot designed for Pokemon Trainers for assistance with pokemon-related information, pokemon battling and their pokemon journey.\n> ${client.guilds.size} Servers\n> Bot Owners: ${owners.join(" ")}\n[Add ${client.user.username} to your own server](${client.config.inviteURL(client)})\n> Running **Frontier ${client.config.version}**\n> Made by <@273865811133857792>\n[Join ${client.user.username} official server](${client.config.guildInviteURL})`)
	  .addField('Commands', '> **Select a module to view a list of commands.**');
  
  message.reply({embeds: [aboutEmbed]}, menu);
}

exports.continueInteraction = (client, interaction) => {
  let { prefix } = client.config;
  let num = interaction.data.values[0],
      data = modules[num];
  var list = [];
  client.commands.forEach(c => {
    if (c.conf.module == num) list.push(c);
  });
  let author_id = interaction.member ? interaction.member.user.id : interaction.user.id;
  let isOwner = client.config.botOwners.includes(author_id);
  
  const mdlsEmbed = new client.embed()
    .setColor(3447003)
    .setAuthor(client.user.username + '#' + client.user.discriminator, client.user.avatarURL)
    .setTitle(data.name + ' Commands')
    .setDescription('> Command Usage:\n> `' + prefix + "command <required> [optional]`\nType `" + prefix + 'help <command name>` for more info on a specific command.')
    .setFooter(data.desc);
  list.forEach(c => {
    if (c.conf.disabled) return;
    if (c.conf.ownerOnly && !isOwner) return;
    mdlsEmbed.addField(c.help.usage ? prefix + c.help.usage : prefix + c.help.name, c.help.shortDesc || "Description not found.");
  });
  
  client.editInteraction(interaction, null, {embeds: [mdlsEmbed]});
}