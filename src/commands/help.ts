import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types.js";

const helpData = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Replies with a list of all commands.");

const help = {
  ...helpData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;
    const res = new EmbedBuilder()
      .setTitle("Commands")
      .setFields([
        {
          name: "`/pet set`",
          value: "Sets the holder of a pet.",
        },
        {
          name: "`/pet check`",
          value: "Returns the last set holder of a pet.",
        },
        {
          name: "`/ping`",
          value: "Replies with 'Pong!'",
        },
      ])
      .setColor("Red")
      .setAuthor({
        name: interaction.client.user.displayName,
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    try {
      await interaction.reply({
        embeds: [res],
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {}
  },
} satisfies Command;

export { help };
