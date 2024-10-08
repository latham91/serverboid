import chalk from "chalk";
import { EmbedBuilder } from "discord.js";
import { convertTimestamp, getFullPath, tailFile, waitForFile } from "../utils/utils.js";
import { connectionRegex, perkLineRegex } from "../utils/regex.js";

export default function watchPerkLog(client) {
  const pathResolver = () => getFullPath("logs", "_PerkLog.txt");

  // Start watching the perk log file
  const start = () => {
    const perkLogPath = getFullPath("logs", "_PerkLog.txt");
    const tail = tailFile(perkLogPath);

    // Listen for new lines added to the bottom of the file.
    tail.on("line", async (line) => {
      // Player connection to server
      if (line.includes("[Login]")) {
        const parsedLine = line.match(connectionRegex);

        let [fullLine, timestamp, steamId, characterName, coords, action, hoursSurvived] = parsedLine;
        timestamp = new Date(convertTimestamp(timestamp)).toLocaleString();

        const messageEmbed = new EmbedBuilder()
          .setColor("#00ff00")
          .setTitle("🖥️ Player Connected")
          .addFields(
            { name: "Character:", value: characterName, inline: true },
            { name: "\u200B", value: "\u200B", inline: false },
            { name: "Steam ID:", value: steamId, inline: true },
            { name: "Coords:", value: coords, inline: true },
            { name: "\u200B", value: "\u200B", inline: false },
            { name: "Hours Survived:", value: hoursSurvived, inline: true },
            { name: "\u200B", value: "\u200B", inline: false }
          )
          .setFooter({ text: timestamp });

        const channelId = process.env.PERKLOG_CHANNEL_ID;
        if (!channelId)
          return console.log(chalk.redBright("PERKLOG_CHANNEL_ID is not defined in your environmental variables."));

        const channel = await client.channels.fetch(channelId);
        if (!channel) return console.log(chalk.redBright("Failed to get channel with ID: ", channelId));

        // Sends embed message
        try {
          await channel.send({ embeds: [messageEmbed] });
        } catch (error) {
          console.log(chalk.redBright("Failed to send perk log message. ", error));
        }
      }

      // Player skill level change
      if (line.includes("[Level Changed")) {
        const parsedLine = line.match(perkLineRegex);

        let [fullLine, timestamp, steamId, characterName, coords, action, skill, level, hoursSurvived] = parsedLine;
        timestamp = new Date(convertTimestamp(timestamp)).toLocaleString();

        const messageEmbed = new EmbedBuilder()
          .setColor("#00b4d8")
          .setTitle("📈 Skill Level Changed")
          .addFields(
            { name: "Character:", value: characterName, inline: true },
            {
              name: "\u200B",
              value: "\u200B",
              inline: true,
            },
            { name: "Steam ID:", value: steamId, inline: true },
            { name: "Skill:", value: skill, inline: true },
            {
              name: "\u200B",
              value: "\u200B",
              inline: true,
            },
            { name: "New Level:", value: level, inline: true },
            { name: "Co-ordinates:", value: coords, inline: true },
            {
              name: "\u200B",
              value: "\u200B",
              inline: true,
            },
            { name: "Hours Survived:", value: hoursSurvived, inline: true }
          )
          .setFooter({ text: timestamp });

        const channelId = process.env.PERKLOG_CHANNEL_ID;
        if (!channelId)
          return console.log(chalk.redBright("PERKLOG_CHANNEL_ID is not defined in your environmental variables."));

        const channel = await client.channels.fetch(channelId);
        if (!channel) return console.log(chalk.redBright("Failed to get channel with ID: ", channelId));

        // Sends embed message to the discord channel
        try {
          await channel.send({ embeds: [messageEmbed] });
        } catch (error) {
          console.log(chalk.redBright("Failed to send perk log message. ", error));
        }
      }
    });

    // Error usually occurs when the file is deleted or doesnt exist yet.
    // Stop watching and wait for the file to be created.
    tail.on("error", (error) => {
      console.log(chalk.bgRed.white.bold("Error watching perk log file: ", error));
      tail.unwatch();

      console.log(chalk.yellow("Waiting for server to create missing perk log file..."));
      waitForFile(pathResolver, 500).then(start);
    });

    console.log(chalk.white.bold("Watching perk log file...OK!"));
  };

  // If the log file doesn't exist yet (ie. server restart), this function keeps re-checking every 1 second before calling the start func
  waitForFile(pathResolver, 1000).then(start);
}
