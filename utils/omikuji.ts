import dayjs from "dayjs";
import { AttachmentBuilder } from "discord.js";
import { createImage } from "./canvas";
import { Omikuji } from "./db";

const unseiList = ["大吉", "吉", "中吉", "小吉", "末吉", "凶", "大凶"];

// Has the given user already drawn an mikuji today?
const hasDrawnToday = async (interaction, user_id): Promise<boolean> => {
  const tryFind = await Omikuji.findOne({
    where: { user_id: user_id },
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

export const drawMikuji = async (interaction, user_id) => {
  const unsei = unseiList[Math.floor(Math.random() * unseiList.length)];

  if (process.env.DEV !== "true" && (await hasDrawnToday(interaction, user_id)))
    return;

  const attachment = new AttachmentBuilder(await createImage(unsei), {
    name: "profile-image.png",
  });

  await interaction.reply({
    content: `Hi <@${user_id}>`,
    files: [attachment],
  });

  return unsei;
};
