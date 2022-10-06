import { config } from "dotenv";
import {
  Attachment,
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  GuildMemberRoleManager,
  PermissionsBitField,
} from "discord.js";
import { join } from "path";
import { GlobalFonts } from "@napi-rs/canvas";

import {
  addLuckyColor,
  addLuckyItem,
  getAllLuckyColors,
  getAllLuckyItems,
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
  if (process.env.DEV === "true") {
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
  } else {
    await Promise.all([Omikuji.sync(), LuckyColor.sync(), LuckyItem.sync()]);
  }

  console.log(await getAllLuckyItems());
  console.log(await getAllLuckyColors());
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user, member } = interaction;

  const isAdmin = (member.permissions as Readonly<PermissionsBitField>).has(
    PermissionsBitField.Flags.Administrator
  );

  switch (commandName) {
    case "おみくじ":
      drawMikuji(interaction, user.id);
      break;
    case "ラッキーカラー追加":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }
      addLuckyColor(interaction.options.getString("カラー名"), interaction);
      break;
    case "ラッキーアイテム追加":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }
      addLuckyItem(interaction.options.getString("アイテム名"), interaction);
      break;
    case "ラッキーカラー一覧":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }
      const file = new AttachmentBuilder("./images/Icon.png");
      const embeds = [
        new EmbedBuilder()
          .setTitle("ラッキーカラー一覧")
          .setThumbnail("attachment://Icon.png")
          .setColor("#c92626")
          .setDescription((await getAllLuckyColors()).join("\n")),
      ];
      await interaction.reply({ embeds, files: [file] });
      break;
    case "ラッキーアイテム一覧":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }
      await interaction.reply((await getAllLuckyItems()).join("\n"));
      break;
    default:
      await interaction.reply("Unknown Command!");
      break;
  }
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
