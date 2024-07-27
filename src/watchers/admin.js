import chalk from "chalk";

import { tailFile, getFullPath, waitForFile, createSimpleEmbed } from "../../utils/utils.js";

export default function watchAdminLog(client) {
  const start = () => {
    const adminLogPath = getFullPath("logs", "_admin.txt");

    // Start watching the chat log file
    const tail = tailFile(adminLogPath);

    // Listen for new lines
    tail.on("line", async (line) => {
      const channelId = process.env.ADMINLOG_CHANNEL_ID;
      if (!channelId)
        return console.log(chalk.redBright("CHATLOG_CHANNEL_ID is not defined in your environmental variables."));

      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.log(chalk.redBright("Failed to get channel with ID: ", channelId));

      try {
        const messageEmbed = createSimpleEmbed("Admin Log", line, "#ff0000");
        await channel.send({ embeds: [messageEmbed] });
      } catch (error) {
        console.log(chalk.redBright("Failed to send admin log message. ", error));
      }
    });

    tail.on("error", (error) => {
      console.log(chalk.bgRed.white.bold("Error watching admin log file: ", error));
      tail.unwatch();

      console.log(chalk.yellow("Waiting for server to create missing admin log file..."));
      waitForFile(pathResolver, 500).then(start);
    });

    console.log(chalk.white.bold("Watching admin log file...OK!"));
  };

  const pathResolver = () => getFullPath("logs", "_admin.txt");

  // Wait for the chat log file to be created
  waitForFile(pathResolver, 1000).then(start);
}
