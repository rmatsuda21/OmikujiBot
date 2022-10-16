import dayjs from "dayjs";
import {
  AttachmentBuilder,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { createImage } from "./canvas";
import { Omikuji } from "./db";
import { updateUserDrawDate, updateUserDrawDateAndCoins } from "./mongodb";

const unseiList = [
  { unsei: "大吉", coin: 6 },
  { unsei: "吉", coin: 5 },
  { unsei: "中吉", coin: 4 },
  { unsei: "小吉", coin: 3 },
  { unsei: "末吉", coin: 2 },
  { unsei: "凶", coin: 1 },
  { unsei: "大凶", coin: 0 },
];

// Has the given user already drawn an mikuji today?
const hasDrawnToday = async (interaction, user_id): Promise<boolean> => {
  const tryFind = await Omikuji.findOne({
    where: { user_id: user_id },
  });

  if (tryFind) {
    const previousDate = dayjs(tryFind.getDataValue("last_pick"));
    const currentDate = dayjs();

    const hasDrawnToday = currentDate.isSame(previousDate);

    if (hasDrawnToday) {
      await interaction.reply(
        "今日のおみくじはすでに引きました！\n又明日おみくじを引きに来てください。"
      );

      return true;
    }

    tryFind.setAttributes("last_pick", currentDate.toString());
  } else {
    await Omikuji.create({
      user_id: user_id,
      last_pick: dayjs().toString(),
    });
  }

  return false;
};

export const drawMikuji = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  user_id: string,
  user_icon?: string,
  user_name?: string
) => {
  const { unsei, coin } =
    unseiList[Math.floor(Math.random() * unseiList.length)];

  if (process.env.DEV !== "true" && (await hasDrawnToday(interaction, user_id)))
    return;

  const attachment = new AttachmentBuilder(await createImage(unsei), {
    name: "profile-image.png",
  });
  const icon = new AttachmentBuilder("./images/Icon.png");
  const iconURL = interaction.guild.iconURL();

  const embeds = [
    new EmbedBuilder()
      .setAuthor({
        name: "本音みくじ",
        iconURL,
      })
      .setColor("#c92626")
      .setTitle(
        `> **今日の運勢**\n` + `> :shinto_shrine: **${unsei}** :shinto_shrine:`
      )
      .setDescription(`**大人のコイン：** +${coin} :coin:`)
      .setThumbnail("attachment://Icon.png")
      .setImage("attachment://profile-image.png")
      .setTimestamp()
      .setFooter({
        text: user_name,
        iconURL: user_icon,
      }),
  ];

  try {
    await updateUserDrawDateAndCoins(user_id, coin);
  } catch (err) {
    console.log(err);
  }

  await interaction
    .reply({
      embeds,
      files: [attachment, icon],
    })
    .catch((err) => {
      console.log(err);
    });
};
