import { config } from "dotenv";
import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  PermissionsBitField,
} from "discord.js";
import { join } from "path";
import { GlobalFonts } from "@napi-rs/canvas";

import { drawMikuji } from "./utils/omikuji";
import {
  addColor,
  addItem,
  connectToDB,
  getAllColors,
  getAllItems,
  getRandomColor,
  getRandomItem,
  seedDB,
} from "./utils/mongodb";

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
    console.log(await getRandomColor());
    console.log(await getRandomItem());
    console.log(await getAllColors());
  }

  console.log("Ready!");
});

// Wait for interaction
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user, member, guild } = interaction;

  const isAdmin = (member.permissions as Readonly<PermissionsBitField>).has(
    PermissionsBitField.Flags.Administrator
  );

  const icon = new AttachmentBuilder("./images/Icon.png");
  let embeds;

  switch (commandName) {
    case "おみくじ":
      drawMikuji(interaction, user.id);
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

      embeds = [
        new EmbedBuilder()
          .setTitle("ラッキーカラー一覧")
          .setThumbnail("attachment://Icon.png")
          .setColor("#c92626")
          .setDescription("```\n" + (await getAllColors()).join("\n") + "```"),
      ];
      await interaction.reply({ embeds, files: [icon] });
      break;
    case "ラッキーアイテム一覧":
      if (!isAdmin) {
        await interaction.reply("Not sufficient permission!");
        break;
      }

      const MAX_PAGE_ITEM_COUNT = 25;
      const items = await getAllItems();
      const pageNum = interaction.options.getNumber("ページ数");
      const maxPageNum = Math.ceil(items.length / MAX_PAGE_ITEM_COUNT);

      const itemList = items
        .splice((pageNum - 1) * MAX_PAGE_ITEM_COUNT, MAX_PAGE_ITEM_COUNT)
        .join("\n");

      embeds = [
        new EmbedBuilder()
          .setAuthor({
            name: "📖 ラッキーアイテム一覧",
            iconURL: interaction.guild.iconURL(),
          })
          .setTitle(`ページ：【 ${pageNum} / ${maxPageNum} 】`)
          .setThumbnail("attachment://Icon.png")
          .setColor("#c92626")
          .setDescription("```\n" + itemList + "```"),
      ];
      await interaction.reply({ embeds, files: [icon] });
      break;
    default:
      await interaction.reply("Unknown Command!");
      break;
  }
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
