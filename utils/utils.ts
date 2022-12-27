import {
  AttachmentBuilder,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import {
  getColorPaginated,
  getItemsPaginated,
  getMaxColorsPageNum,
  getMaxItemsPageNum,
} from "./mongodb";

const icon = new AttachmentBuilder("./images/Icon.png");

export const getLuckyColors = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  let pageNum = interaction.options.getNumber("ページ数") || 1;
  const maxPageNum = await getMaxColorsPageNum();
  const items = (await getColorPaginated(pageNum)).join("\n");

  await interaction.reply(
    await getList(
      interaction,
      pageNum,
      maxPageNum,
      items,
      "📖 ラッキーカラー一覧"
    )
  );
};

export const getLuckyItems = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  let pageNum = interaction.options.getNumber("ページ数") || 1;
  const maxPageNum = await getMaxItemsPageNum();
  const items = (await getItemsPaginated(pageNum)).join("\n");

  await interaction.reply(
    await getList(
      interaction,
      pageNum,
      maxPageNum,
      items,
      "📖 ラッキーアイテム一覧"
    )
  );
};

export const getList = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  pageNum: number,
  maxPageNum: number,
  items: string,
  title: string
) => {
  if (pageNum <= 0) pageNum = 1;
  if (pageNum > maxPageNum) pageNum = maxPageNum;

  const embeds = [
    new EmbedBuilder()
      .setAuthor({
        name: title,
        iconURL: interaction?.guild?.iconURL() || "",
      })
      .setTitle(`ページ：【 ${pageNum} / ${maxPageNum} 】`)
      .setThumbnail("attachment://Icon.png")
      .setColor("#c92626")
      .setDescription("```\n" + items + "```"),
  ];

  return { embeds, files: [icon] };
};
