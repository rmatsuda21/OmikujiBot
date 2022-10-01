import { config } from "dotenv";
import { join } from "path";
import { Client, GatewayIntentBits, AttachmentBuilder } from "discord.js";
import { GlobalFonts } from "@napi-rs/canvas";
import dayjs from "dayjs";

import { Omikuji } from "./utils/db";
import { drawMikuji } from "./utils/omikuji";
import { createImage } from "./utils/canvas";

// Setup
config();
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
client.once("ready", () => {
  Omikuji.sync({ force: true });
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  switch (commandName) {
    case "おみくじ":
      const tryFind = await Omikuji.findOne({
        where: { user_id: user.id },
      });

      if (tryFind) {
        const previousDate = dayjs(tryFind.getDataValue("last_pick"));
        const currentDate = dayjs();

        const hasDrawnToday =
          previousDate.month === currentDate.month &&
          previousDate.date === currentDate.date;

        if (hasDrawnToday) {
          await interaction.reply(
            "今日のおみくじはすでに引きました！\n又明日おみくじを引きに来てください。"
          );

          return;
        } else {
          tryFind.setAttributes("last_pick", currentDate.toString());
        }
      } else {
        await Omikuji.create({
          user_id: user.id,
          last_pick: dayjs().toString(),
        });
      }

      const attachment = new AttachmentBuilder(
        await createImage(drawMikuji(user.id)),
        { name: "profile-image.png" }
      );

      await interaction.reply({ files: [attachment] });
      break;
    default:
      await interaction.reply("Unknown Command!");
      break;
  }
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
