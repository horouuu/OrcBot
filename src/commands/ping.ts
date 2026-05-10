import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types";

const pingData = new SlashCommandBuilder()
  .setName("ping")
  .setDescription('Replies with "Pong!"');

const ping = {
  ...pingData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;

    try {
      await interaction.reply({
        content: "Pong!",
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {}
  },
} satisfies Command;

export { ping };
