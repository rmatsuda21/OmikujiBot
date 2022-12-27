import { config } from "dotenv";
import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";
import { join } from "path";
import { GlobalFonts } from "@napi-rs/canvas";

import { drawMikuji } from "./utils/omikuji";
import {
  addColor,
  addItem,
  cleanupDB,
  connectToDB,
  removeItem,
  seedDB,
} from "./utils/mongodb";

import { getLuckyColors, getLuckyItems } from "./utils/utils";
import { showRank } from "./utils/showRank";
import { showProfile } from "./utils/showProfile";

var nodeCleanup = require("node-cleanup");

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
  await connectToDB();

  if (process.env.DEV === "true") {
    await seedDB();
  }

  console.log("Ready!");
});

// Wait for interaction
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user, member, guild } = interaction;
  const { id, username } = user;

  const avatarURL = user.avatarURL();

  const isAdmin = (member.permissions as Readonly<PermissionsBitField>).has(
    PermissionsBitField.Flags.Administrator
  );

  switch (commandName) {
    case "おみくじ":
    case "omi":
    case "o":
      await drawMikuji(interaction, id, avatarURL, username);
      break;
    case "rank":
      await showRank(interaction);
      break;
    case "profile":
      await showProfile(interaction, id, username, avatarURL);
      break;
    case "ラッキーカラー追加":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }
      try {
        addColor(interaction.options.getString("カラー名"));
        interaction.reply("Added color!");
      } catch (err) {
        interaction.reply("Error!");
      }
      break;
    case "ラッキーアイテム追加":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }
      try {
        addItem(interaction.options.getString("アイテム名"));
        interaction.reply("Added item!");
      } catch (err) {
        interaction.reply("Error!");
      }
      break;
    case "ラッキーカラー一覧":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }

      await getLuckyColors(interaction);
      break;
    case "ラッキーアイテム一覧":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }

      await getLuckyItems(interaction);
      break;
    case "ラッキーアイテム消去":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }

      const res = await removeItem(interaction.options.getString("アイテム名"));
      if (res) {
        await interaction.reply("Removed Item!");
      } else {
        await interaction.reply("Could not remove!");
      }
      break;
    default:
      await interaction.reply("Unknown Command!");
      break;
  }
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);

// Clean up
const exitHandler = (exitCode, signal) => {
  if (signal) {
    cleanupDB().then(() => process.kill(process.pid, signal));
    nodeCleanup.uninstall();
    return false;
  }
};

nodeCleanup(exitHandler);
