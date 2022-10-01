require("dotenv").config();
const { REST, SlashCommandBuilder, Routes } = require("discord.js");
const { BOT_TOKEN, GUILD_ID, CLIENT_ID } = process.env;

const commands = [
  new SlashCommandBuilder()
    .setName("おみくじ")
    .setDescription("おみくじを引く！"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

rest
  .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
  .then((data) =>
    console.log(`Successfully registered ${data.length} application commands.`)
  )
  .catch(console.error);
