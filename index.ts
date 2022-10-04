import { config } from "dotenv";
import { join } from "path";
import { Client, GatewayIntentBits } from "discord.js";
import { GlobalFonts } from "@napi-rs/canvas";

import { LuckyColor, LuckyItem, Omikuji } from "./utils/db";
import { drawMikuji } from "./utils/omikuji";

// Setup
config();
GlobalFonts.registerFromPath(
  join(__dirname, "fonts", "Zen_Maru_Gothic", "ZenMaruGothic-Light.ttf"),
  "ZenMaruLight"
);
GlobalFonts.registerFromPath(
  join(__dirname, "fonts", "Zen_Maru_Gothic", "ZenMaruGothic-Regular.ttf"),
  "ZenMaruRegular"
);
GlobalFonts.registerFromPath(
  join(__dirname, "fonts", "Zen_Maru_Gothic", "ZenMaruGothic-Bold.ttf"),
  "ZenMaruBold"
);
GlobalFonts.registerFromPath(
  join(__dirname, "fonts", "Zen_Maru_Gothic", "ZenMaruGothic-Black.ttf"),
  "ZenMaruBlack"
);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  await Promise.all([Omikuji.sync(), LuckyColor.sync(), LuckyItem.sync()]);
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  switch (commandName) {
    case "おみくじ":
      drawMikuji(interaction, user.id);
      break;
    default:
      await interaction.reply("Unknown Command!");
      break;
  }
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
