import {
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "dotenv";

config();
const { BOT_TOKEN = "", GUILD_ID = "", CLIENT_ID = "" } = process.env;

interface IOption {
  type: "string" | "number" | "boolean";
  option_name: string;
  option_description: string;
  required: boolean;
}

interface ICommandMap {
  names: string[];
  description: string;
  options?: IOption[];
  memberPermission?: bigint;
}

const commandMaps: ICommandMap[] = [
  { names: ["おみくじ", "omi", "o"], description: "おみくじを引く！" },
  { names: ["rank"], description: "ランク一覧を見る！" },
  { names: ["profile"], description: "自分のプロフィールを見る！" },
  { names: ["shop"], description: "本音コインでお買い物！" },
  {
    names: ["ラッキーアイテム追加"],
    description: "ラッキーアイテムを追加する",
    options: [
      {
        type: "string",
        option_name: "アイテム名",
        option_description: "追加したいラッキーアイテムの名前",
        required: true,
      },
    ],
    memberPermission: PermissionsBitField.Flags.Administrator,
  },
  {
    names: ["ラッキーカラー追加"],
    description: "ラッキーカラーを追加する",
    options: [
      {
        type: "string",
        option_name: "カラー名",
        option_description: "追加したいラッキーカラーの名前",
        required: true,
      },
    ],
    memberPermission: PermissionsBitField.Flags.Administrator,
  },
  {
    names: ["ラッキーカラー一覧"],
    description: "ラッキーカラーをすべて見る",
    options: [
      {
        type: "number",
        option_name: "ページ数",
        option_description: "一覧のページ数",
        required: true,
      },
    ],
    memberPermission: PermissionsBitField.Flags.Administrator,
  },
  {
    names: ["ラッキーアイテム一覧"],
    description: "ラッキーアイテムをすべて見る",
    options: [
      {
        type: "number",
        option_name: "ページ数",
        option_description: "一覧のページ数",
        required: true,
      },
    ],
    memberPermission: PermissionsBitField.Flags.Administrator,
  },
  {
    names: ["ラッキーアイテム消去"],
    description: "指定のラッキーアイテムを消去する",
    options: [
      {
        type: "string",
        option_name: "アイテム名",
        option_description: "消去したいアイテムの名前",
        required: true,
      },
    ],
    memberPermission: PermissionsBitField.Flags.Administrator,
  },
  {
    names: ["ラッキーカラー消去"],
    description: "指定のラッキーカラーを消去する",
    options: [
      {
        type: "string",
        option_name: "カラー名",
        option_description: "消去したいカラーの名前",
        required: true,
      },
    ],
    memberPermission: PermissionsBitField.Flags.Administrator,
  },
];

const commands = commandMaps.flatMap(
  ({ names, description, options, memberPermission }) => {
    return names.map((name) => {
      const scb = new SlashCommandBuilder();
      scb.setName(name);
      scb.setDescription(description);
      if (options) {
        options.forEach((option) => {
          const func = (item) =>
            item
              .setName(option.option_name)
              .setDescription(option.option_description)
              .setRequired(option.required);

          if (option.type === "string") scb.addStringOption(func);
          else if (option.type === "number") scb.addNumberOption(func);
          else if (option.type === "boolean") scb.addBooleanOption(func);
        });
      }
      if (memberPermission) scb.setDefaultMemberPermissions(memberPermission);
      return scb.toJSON();
    });
  }
);

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

rest
  .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
  .then((data: any) =>
    console.log(`Successfully registered ${data.length} application commands.`)
  )
  .catch(console.error);
