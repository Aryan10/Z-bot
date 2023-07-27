module.exports = (client, interaction) => {
  let args = interaction.data.custom_id.split(' ');
  let command = client.commands.get(args[1]);
  command.run(client, interaction, args.slice(2).join(' '))
}