import { SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
import {
  buildUpdatePowerSubcommand,
  handleUpdatePower,
} from "./_power/_update.js";
import {
  buildFetchPowerSubcommand,
  handleFetchPower,
} from "./_power/_!fetch.js";

const powerData = new SlashCommandBuilder()
  .setName("power")
  .setDescription("Guild power-related commands.")
  .addSubcommand(buildUpdatePowerSubcommand)
  .addSubcommand(buildFetchPowerSubcommand);

type PowerCmds = "update";

const handlers = {
  update: handleUpdatePower,
  fetch: handleFetchPower,
};

const power = {
  ...powerData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;
    const subCmd = interaction.options.getSubcommand() as PowerCmds;
    try {
      await handlers[subCmd](cmdContext);
    } catch (e) {
      catchAllInteractionReply(interaction);
    }
  },
} satisfies Command;

export { power };
