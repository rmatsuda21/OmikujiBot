import {
  AttachmentBuilder,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { createImage } from "./canvas";
import { getUser, updateUserWithDraw } from "./mongodb";
import moment from "moment-timezone";

const unseiList = [
  { unsei: "大吉", coin: 6, xp: 4, chance: 6 },
  { unsei: "吉", coin: 5, xp: 3, chance: 16 },
  { unsei: "中吉", coin: 4, xp: 3, chance: 22 },
  { unsei: "小吉", coin: 3, xp: 2, chance: 28 },
  { unsei: "末吉", coin: 2, xp: 2, chance: 25 },
  { unsei: "凶", coin: 1, xp: 1, chance: 15 },
  { unsei: "大凶", coin: 0, xp: 1, chance: 6 },
];

// Has the given user already drawn a mikuji today?
const hasDrawnToday = async (interaction, user_id): Promise<boolean> => {
  const user = await getUser(user_id);

  if (user) {
    const previousDate = moment(user.last_draw);
    const currentDate = moment();

    const hasDrawnToday = currentDate.isSame(previousDate, "day");

    if (hasDrawnToday) {
      await interaction.reply(
        "今日のおみくじはすでに引きました！\n又明日おみくじを引きに来てください。"
      );

      return true;
    }
  }

  return false;
};

export const drawMikuji = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  user_id: string,
  user_icon?: string,
  user_name?: string
) => {
  let unseiIndex = 0;

  let chanceSum = 0;
  const chanceAccum = unseiList.map((unsei) => {
    chanceSum += unsei.chance;
    return chanceSum;
  });

  const randNum = Math.floor(
    Math.random() * chanceAccum[chanceAccum.length - 1]
  );
  for (let i = 0; i < chanceAccum.length; ++i) {
    if (randNum < chanceAccum[i]) {
      unseiIndex = i;
      break;
    }
  }

  const { unsei, coin, xp } = unseiList[unseiIndex];

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
      .setDescription(
        `**本音コイン：** +${coin} 🪙\n **大人な経験値：** +${xp} 💠`
      )
      .setThumbnail("attachment://Icon.png")
      .setImage("attachment://profile-image.png")
      .setTimestamp()
      .setFooter({
        text: user_name,
        iconURL: user_icon,
      }),
  ];

  try {
    await updateUserWithDraw(user_id, user_name, coin, xp, unsei);
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
