import { config } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { join } from "path";
import { GlobalFonts } from "@napi-rs/canvas";

import {
  addLuckyColor,
  addLuckyItem,
  LuckyColor,
  LuckyItem,
  Omikuji,
} from "./utils/db";
import { drawMikuji } from "./utils/omikuji";
const { colors }: { colors: string[] } = require("./data/luckyColor.json");
const { items }: { items: string[] } = require("./data/luckyItem.json");

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
GlobalFonts.registerFromPath(
  join(__dirname, "fonts", "HuangYou", "HuangYou.ttf"),
  "HuangYou"
);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  await Promise.all([
    Omikuji.sync({ force: true }),
    LuckyColor.sync({ force: true }),
    LuckyItem.sync({ force: true }),
  ]);
  await LuckyColor.bulkCreate(
    colors.map((color) => {
      return { color };
    })
  );
  await LuckyItem.bulkCreate(
    items.map((item) => {
      return { item: item };
    })
  );

  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  switch (commandName) {
    case "おみくじ":
      drawMikuji(interaction, user.id);
      break;
    case "ラッキーカラー追加":
      addLuckyColor(interaction.options.getString("カラー名"), interaction);
      break;
    case "ラッキーアイテム追加":
      addLuckyItem(interaction.options.getString("アイテム名"), interaction);
      break;
    default:
      await interaction.reply("Unknown Command!");
      break;
  }
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
