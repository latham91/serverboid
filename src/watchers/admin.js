import chalk from "chalk";
import { tailFile, getFullPath, waitForFile, createSimpleEmbed, createBtseEmbed } from "../utils/utils.js";
import { btseLineRegex } from "../utils/regex.js";

export default function watchAdminLog(client) {
  const pathResolver = () => getFullPath("logs", "_admin.txt");

  const adminLogPath = getFullPath("logs", "_admin.txt");
  const channelId = process.env.ADMINLOG_CHANNEL_ID;

  if (!channelId) return console.log(chalk.redBright("ADMINLOG_CHANNEL_ID is not defined in your environmental variables."));

  const start = () => {
    const tail = tailFile(adminLogPath);

    // Listen for new lines added to the bottom of the file.
    tail.on("line", async (line) => {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.log(chalk.redBright(`Failed to get channel with ID: ${channelId}`));

      // Send embed message to the discord channel.
      try {
        if (line.includes("[BTSE]")) {
          const match = line.match(btseLineRegex);
          const [fullLine, timestamp, identifier, steamId, username, action] = match;
          try {
            const messageEmbed = createBtseEmbed(username, steamId, action, timestamp);

            await channel.send({ embeds: [messageEmbed] });

            // Handle button interactions
            console.log(response);
          } catch (error) {
            console.log(chalk.redBright("Failed to send BTSE log message. ", error));
          }
        } else {
          const messageEmbed = createSimpleEmbed("Admin Log", line, "#ff0000");
          await channel.send({ embeds: [messageEmbed] });
        }
      } catch (error) {
        console.log(chalk.redBright("Failed to send admin log message. ", error));
      }
    });

    // Error usually occurs when the file is deleted or doesnt exist yet.
    // Stop watching and wait for the file to be created.
    tail.on("error", (error) => {
      console.log(chalk.bgRed.white.bold("Error watching admin log file: ", error));
      tail.unwatch();

      console.log(chalk.yellow("Waiting for server to create missing admin log file..."));
      waitForFile(pathResolver, 500).then(start);
    });

    console.log(chalk.white.bold("Watching admin log file...OK!"));
  };

  // If the log file doesn't exist yet (ie. server restart), this function keeps re-checking every 1 second before calling the start func
  waitForFile(pathResolver, 1000).then(start);
}
