import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

config();
const { BOT_TOKEN = "", GUILD_ID = "", CLIENT_ID = "" } = process.env;

const commands = [
  new SlashCommandBuilder()
    .setName("おみくじ")
    .setDescription("おみくじを引く！"),
  new SlashCommandBuilder()
    .setName("ラッキーアイテム追加")
    .setDescription("ラッキーアイテムを追加する")
    .addStringOption((item) =>
      item
        .setName("アイテム名")
        .setDescription("追加したいラッキーアイテムの名前")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("ラッキーカラー追加")
    .setDescription("ラッキーカラーを追加する")
    .addStringOption((color) =>
      color
        .setName("カラー名")
        .setDescription("追加したいラッキーカラーの名前")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("ラッキーカラー一覧")
    .setDescription("ラッキーカラーをすべて見る"),
  new SlashCommandBuilder()
    .setName("ラッキーアイテム一覧")
    .setDescription("ラッキーアイテムをすべて見る")
    .addNumberOption((item) =>
      item.setName("ページ数").setDescription("hi").setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

rest
  .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
  .then((data: any) =>
    console.log(`Successfully registered ${data.length} application commands.`)
  )
  .catch(console.error);
