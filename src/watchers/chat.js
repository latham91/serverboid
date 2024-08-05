import chalk from "chalk";

import { tailFile, getFullPath, getChatColors, createSimpleEmbed, waitForFile, convertTimestamp } from "../utils/utils.js";
import { chatLineRegex } from "../utils/regex.js";

const excludedWords = ["HEY!", "OVER HERE!", "HEY YOU!", "HEY !", "PAR ICI !", "HEY TOI !"];

export default function watchChatLog(client) {
  const pathResolver = () => getFullPath("logs", "_chat.txt");

  // Start watching the chat log file
  const start = () => {
    const chatLogPath = getFullPath("logs", "_chat.txt");
    const tail = tailFile(chatLogPath);

    // Resolver function that returns the full path of the log file.

    // Listen for new lines added to the bottom of the file.
    tail.on("line", async (line) => {
      if (!line.includes("Got message")) return;

      // Parses the last line of the chat log file against the chatLineRegex in utils/regex.js
      const parsedLine = line.match(chatLineRegex);
      if (!parsedLine) return console.log(chalk.redBright("Failed to parse chat log line."));

      // Destructure the parsed line into variables
      let [, timestamp, region, author, message] = parsedLine;

      // Skip messages that contain excluded words
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

      // Sends embed message to the discord channel
      try {
        await channel.send({ embeds: [messageEmbed] });
      } catch (error) {
        console.log(chalk.redBright("Failed to send chat log message. ", error));
      }
    });

    // Error usually occurs when the file is deleted or doesnt exist yet.
    // Stop watching and wait for the file to be created.
    tail.on("error", (error) => {
      console.log(chalk.bgRed.white.bold("Error watching chat log file: ", error));
      tail.unwatch();

      console.log(chalk.yellow("Waiting for server to create missing chat log file..."));
      waitForFile(pathResolver, 500).then(start);
    });

    console.log(chalk.white.bold("Watching chat log file...OK!"));
  };

  // If the log file doesn't exist yet (ie. server restart), this function keeps re-checking every 1 second before calling the start func
  waitForFile(pathResolver, 1000).then(start);
}
