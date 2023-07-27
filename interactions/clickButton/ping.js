module.exports = (client, interaction) => {
  client.replyInteraction(interaction, null, 'Pong!', {ephemeral: true});
}