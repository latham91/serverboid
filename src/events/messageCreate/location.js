import "dotenv/config";
import { createCanvas } from "canvas";
import fs from "fs";
import xml2js from "xml2js";

export default async function (message, client, handler) {
  if (message.author.bot) return;

  if (message.content === "!location") {
    const x = 10869; // Example coordinates
    const y = 9920;

    // Load the XML from a local file
    const worldMapText = fs.readFileSync(process.env.WORLD_MAP_PATH, "utf8");

    // Parse the XML using xml2js
    const parser = new xml2js.Parser();
    const xmlDoc = await parser.parseStringPromise(worldMapText);

    // Access cells from the parsed XML
    const cells = xmlDoc.world.cell || [];

    // Check if cells are found
    if (!cells.length) {
      console.error("No cells found in the XML.");
      return;
    }

    // Create a canvas element
    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext("2d");

    // Drawing options
    const zoomLevel = 0.55;
    const scale = 2 * zoomLevel;
    const chunkSize = 300;
    const zoomCompensation = Math.max(1, 1 / zoomLevel);

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the number of chunks to render in each direction
    const chunksToRender = Math.ceil(1 / zoomLevel);
    const centerChunkX = Math.floor(x / chunkSize);
    const centerChunkY = Math.floor(y / chunkSize);

    for (let offsetY = -Math.floor(chunksToRender / 2); offsetY <= Math.floor(chunksToRender / 2); offsetY++) {
      for (let offsetX = -Math.floor(chunksToRender / 2); offsetX <= Math.floor(chunksToRender / 2); offsetX++) {
        const chunkX = centerChunkX + offsetX;
        const chunkY = centerChunkY + offsetY;

        // Access the correct cell based on chunk coordinates
        const cell = cells.find((c) => parseInt(c.$.x, 10) === chunkX && parseInt(c.$.y, 10) === chunkY);

        if (cell) {
          ctx.save();
          ctx.translate(
            chunkSize * (offsetX + Math.floor(chunksToRender / 2)) * scale,
            chunkSize * (offsetY + Math.floor(chunksToRender / 2)) * scale
          );
          ctx.scale(scale, scale);

          ctx.fillStyle = "rgb(219, 215, 192)"; // Default color
          ctx.fillRect(0, 0, chunkSize, chunkSize);

          // Render features within each cell
          const features = cell.feature || [];
          features.forEach((feature) => {
            const geometries = feature.geometry.filter((g) => g.$.type === "Polygon");

            geometries.forEach((geometry) => {
              const coordinates = geometry.coordinates[0];
              if (coordinates && coordinates.point) {
                const points = coordinates.point.map((point) => [parseInt(point.$.x, 10), parseInt(point.$.y, 10)]);

                // Get feature color
                const featureValue = feature.properties[0]?.property[0]?.$?.value || "default";
                const color = getFeatureColor(featureValue);

                // Draw the polygon
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                points.slice(1).forEach((point) => ctx.lineTo(point[0], point[1]));
                ctx.closePath();
                ctx.fill();
              }
            });
          });

          ctx.restore();
        }
      }
    }

    // Render player marker
    const baseMarkerSize = 3;
    const markerSize = baseMarkerSize * scale * zoomCompensation;
    const posX = (x % chunkSize) * scale + chunkSize * Math.floor(chunksToRender / 2) * scale;
    const posY = (y % chunkSize) * scale + chunkSize * Math.floor(chunksToRender / 2) * scale;
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(posX - markerSize / 2, posY - markerSize / 2, markerSize, markerSize);

    // Render coordinates text
    const baseTextSize = 6;
    const textSize = baseTextSize * scale * zoomCompensation;
    const textOffset = 5 * scale * zoomCompensation;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.font = `bold ${textSize}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`(${x}, ${y})`, posX + markerSize / 2 + textOffset, posY - markerSize / 2);

    // Save the canvas to a buffer
    const buffer = canvas.toBuffer();

    // Send the image in Discord
    await message.channel.send({ files: [{ attachment: buffer, name: "map.png" }] });
  }
}

// Helper function to get feature colors
function getFeatureColor(value) {
  const colors = {
    default: "rgb(219, 215, 192)",
    forest: "rgb(189, 197, 163)",
    river: "rgb(59, 141, 149)",
    trail: "rgb(185, 122, 87)",
    tertiary: "rgb(171, 158, 143)",
    secondary: "rgb(134, 125, 113)",
    primary: "rgb(134, 125, 113)",
    "*": "rgb(200, 191, 231)",
    yes: "rgb(210, 158, 105)",
    Residential: "rgb(210, 158, 105)",
    CommunityServices: "rgb(139, 117, 235)",
    Hospitality: "rgb(127, 206, 225)",
    Industrial: "rgb(56, 54, 53)",
    Medical: "rgb(229, 128, 151)",
    RestaurantsAndEntertainment: "rgb(245, 225, 60)",
    RetailAndCommercial: "rgb(184, 205, 84)",
  };

  return colors[value] || "rgb(219, 215, 192)"; // Default color
}
