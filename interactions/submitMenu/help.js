module.exports = (client, interaction) => {
  const help = client.commands.get('help');
  help.continueInteraction(client, interaction);
}