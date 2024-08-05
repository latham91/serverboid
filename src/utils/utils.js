import "dotenv/config";
import fs from "fs";
import { EmbedBuilder } from "discord.js";
import { Tail } from "tail";

// Returns the full path of a file
export function getFullPath(folder, fileName) {
  if (folder === "logs") {
    const findFile = fs.readdirSync(process.env.LOGS_PATH).find((f) => f.includes(fileName));
    const fullPath = process.env.LOGS_PATH + `/${findFile}`;

    return fullPath;
  }

  if (folder === "lua") {
    const findFile = fs.readdirSync(process.env.LUA_PATH).find((f) => f.includes(fileName));
    const fullPath = process.env.LUA_PATH + `/${findFile}`;

    return fullPath;
  }
}

export function tailFile(fullPath) {
  const tail = new Tail(fullPath);

  return tail;
}

// Convert timestamp to ISO format
export function convertTimestamp(timestamp) {
  const [date, time] = timestamp.split(" ");
  const [day, month, year] = date.split("-");
  const parsedDate = new Date(`20${year}-${month}-${day}T${time}Z`);

  return parsedDate.toISOString();
}

// Retuns colors for chat embeds
export function getChatColors() {
  return {
    local: "#ffffff",
    general: "#f4a261",
    faction: "#00b4d8",
    private: "#8338ec",
  };
}

// Create simple discord embed
export function createSimpleEmbed(title, description, color) {
  const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);

  return embed;
}

// Wait for a file to be created
export const waitForFile = (filePathResolver, interval) => {
  return new Promise((resolve) => {
    const checkFile = setInterval(() => {
      const filePath = filePathResolver();
      if (fs.existsSync(filePath)) {
        clearInterval(checkFile);
        resolve(filePath);
      }
    }, interval);
  });
};
