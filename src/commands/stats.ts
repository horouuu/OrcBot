import { SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
import {
  buildUpdateStatsSubcommand,
  handleUpdateStats,
} from "./_stats/_update.js";

const statsData = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Update or check your stats.")
  .addSubcommand(buildUpdateStatsSubcommand);

type StatsCmds = "update";

const handlers = {
  update: handleUpdateStats,
};

const stats = {
  ...statsData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;
    const subCmd = interaction.options.getSubcommand() as StatsCmds;
    try {
      await handlers[subCmd](cmdContext);
    } catch (e) {
      catchAllInteractionReply(interaction);
      console.error(e);
    }
  },
} satisfies Command;

export { stats };
