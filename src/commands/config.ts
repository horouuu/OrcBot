import {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { CommandContext, Command } from "../bot.types.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
import { buildGcSubcommand, handleGc } from "./_config/_!gc.js";

const configData = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Change certain configurations.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(buildGcSubcommand);

type ConfigCmds = "gc";

const handlers = {
  gc: handleGc,
};

const config = {
  ...configData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    const sc = interaction.options.getSubcommand() as ConfigCmds;
    if (!interaction.isChatInputCommand()) return;
    try {
      if (
        !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
      ) {
        const failEmbed = new EmbedBuilder()
          .setDescription("You must be an administrator to use this command!")
          .setColor("DarkRed");

        await interaction.reply({
          embeds: [failEmbed],
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      await handlers[sc](cmdContext);
    } catch (e) {
      catchAllInteractionReply(interaction);
      console.error(e);
    }
  },
} satisfies Command;

export { config };
