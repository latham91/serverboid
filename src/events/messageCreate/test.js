export default function (message, client, handler) {
  const prefix = process.env.PREFIX;
  if (message.content === `${prefix}ping`) {
    if (message.author.bot) return;

    message.channel.send("Pong!");
  }
}
