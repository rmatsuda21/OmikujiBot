import {
  AttachmentBuilder,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getUser } from "./mongodb";

export const showProfile = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  id: string,
  user_name: string,
  user_icon?: string
) => {
  const user = await getUser(id);

  const embeds = [
    new EmbedBuilder()
      .setAuthor({
        name: "⛩ おみくじBOT ⛩",
        iconURL: interaction?.guild?.iconURL() || "",
      })
      .setTitle(`🔖 **プロフィール**`)
      .setColor("#c92626")
      .setDescription(
        `**本音コイン** \`${user?.coins} 🪙\`\n**大人な経験値** \`${user?.xp} 💠\``
      )
      .setThumbnail(user_icon)
      .setFooter({
        text: user_name,
      }),
  ];

  interaction.reply({ embeds });
};
