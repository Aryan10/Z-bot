module.exports = (client, interaction) => {
  const learn = client.commands.get('learn');
  learn.continueInteraction(client, interaction);
}