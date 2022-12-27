import {
  AttachmentBuilder,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getTopUsersPaginated } from "./mongodb";

// const icon = new AttachmentBuilder("./images/Icon.png");

const getRankText = (user, icon) => {
  if (!user) return "";
  return `${icon} <@${user.userId}> - \`XP: ${user.xp || 0}\``;
};
export const showRank = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const topUsers = await getTopUsersPaginated(1);
  let rankText =
    getRankText(topUsers[0], ":first_place:") +
    "\n" +
    getRankText(topUsers[1], ":second_place:") +
    "\n" +
    getRankText(topUsers[2], ":third_place:") +
    "\n" +
    getRankText(topUsers[3], ":four:") +
    "\n" +
    getRankText(topUsers[4], ":five:") +
    "\n" +
    getRankText(topUsers[5], ":six:") +
    "\n" +
    getRankText(topUsers[6], ":seven:") +
    "\n" +
    getRankText(topUsers[7], ":eight:") +
    "\n" +
    getRankText(topUsers[8], ":nine:") +
    "\n" +
    getRankText(topUsers[9], ":pray:");
  const embeds = [
    new EmbedBuilder()
      .setAuthor({
        name: "⛩ おみくじBOT ⛩",
        iconURL: interaction?.guild?.iconURL() || "",
      })
      .setTitle("🏆  **おみくじランキング**")
      .setColor("#c92626")
      .setDescription(rankText.trimEnd()),
  ];

  interaction.reply({ embeds });
};
