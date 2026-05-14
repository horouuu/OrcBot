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
import { buildLbSubcommand, handleLb } from "./_power/_!lb.js";

const powerData = new SlashCommandBuilder()
  .setName("power")
  .setDescription("Guild power-related commands.")
  .addSubcommand(buildUpdatePowerSubcommand)
  .addSubcommand(buildFetchPowerSubcommand)
  .addSubcommand(buildLbSubcommand);

type PowerCmds = "update" | "fetch" | "lb";

const handlers = {
  update: handleUpdatePower,
  fetch: handleFetchPower,
  lb: handleLb,
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
      console.error(e);
    }
  },
} satisfies Command;

export { power };
