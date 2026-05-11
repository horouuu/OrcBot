import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types.js";

const checkpetData = new SlashCommandBuilder()
  .setName("checkpet")
  .setDescription('"');

const checkpet = {
  ...checkpetData.toJSON(),
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

export { checkpet };
