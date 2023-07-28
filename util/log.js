module.exports = (client, args) => {
  let ping = Date.now() + ' Command Recieved';
  if (args.content) ping += ' from ' + args.author.username;
  console.log(ping);
}