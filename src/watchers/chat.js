import chalk from "chalk";

import { tailFile, getFullPath, getChatColors, createSimpleEmbed, waitForFile, convertTimestamp } from "../utils/utils.js";
import { chatLineRegex } from "../utils/regex.js";

const excludedWords = ["HEY!", "OVER HERE!", "HEY YOU!", "HEY !", "PAR ICI !", "HEY TOI !"];

export default function watchChatLog(client) {
  const start = () => {
    const chatLogPath = getFullPath("logs", "_chat.txt");

    // Start watching the chat log file
    const tail = tailFile(chatLogPath);

    // Listen for new lines
    tail.on("line", async (line) => {
      if (!line.includes("Got message")) return;

      const parsedLine = line.match(chatLineRegex);
      if (!parsedLine) return console.log(chalk.redBright("Failed to parse chat log line."));

      let [, timestamp, region, author, message] = parsedLine;

      if (excludedWords.some((word) => message.includes(word))) return;

      timestamp = new Date(convertTimestamp(timestamp)).toLocaleString();

      const colors = getChatColors();
      const regionColor = colors[region.toLowerCase()] || "#ffffff";

      const messageEmbed = createSimpleEmbed(region, `**${author}**: ${message}`, regionColor);
      const channelId = process.env.CHATLOG_CHANNEL_ID;

      if (!channelId)
        return console.log(chalk.redBright("CHATLOG_CHANNEL_ID is not defined in your environmental variables."));

      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.log(chalk.redBright("Failed to get channel with ID: ", channelId));

      try {
        await channel.send({ embeds: [messageEmbed] });
      } catch (error) {
        console.log(chalk.redBright("Failed to send chat log message. ", error));
      }
    });

    tail.on("error", (error) => {
      console.log(chalk.bgRed.white.bold("Error watching chat log file: ", error));
      tail.unwatch();

      console.log(chalk.yellow("Waiting for server to create missing chat log file..."));
      waitForFile(pathResolver, 500).then(start);
    });

    console.log(chalk.white.bold("Watching chat log file...OK!"));
  };

  const pathResolver = () => getFullPath("logs", "_chat.txt");

  // Wait for the chat log file to be created
  waitForFile(pathResolver, 1000).then(start);
}
