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
          name: "`/pet set [petId] [holder]`",
          value:
            "Forces the holder of a pet to change to the specified holder.",
        },
        {
          name: "`/pet list [all | summon | furnace | altar]`",
          value:
            'Lists all pets of the specified type. "All" will list all available pets instead.',
        },
        {
          name: "`/pet claim [petId]`",
          value:
            "Claims a pet from its previous holder, or the owner if there is no current holder.",
        },
        {
          name: "`/pet add [type] [owner]`",
          value:
            "Adds a pet to the pet system and associates it with the specified owner.",
        },
        {
          name: "`/pet del [petId]`",
          value: "Removes the specified pet from the pet system.",
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
