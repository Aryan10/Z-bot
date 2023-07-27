module.exports = (message) => {
  let ping = Date.now() + ' Command Recieved';
  if (message) ping += ' from ' + message.author.username;
  console.log(ping);
}