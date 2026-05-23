import { SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
import { buildCalcWorldSubcommand, handleCalcWorld } from "./_calc/_world.js";

const calcData = new SlashCommandBuilder()
  .setName("calc")
  .setDescription("Calculation-related commands.")
  .addSubcommand(buildCalcWorldSubcommand);

type CalcCmds = "world";

const handlers = {
  world: handleCalcWorld,
};

const calc = {
  ...calcData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;
    const subCmd = interaction.options.getSubcommand() as CalcCmds;
    try {
      await handlers[subCmd](cmdContext);
    } catch (e) {
      catchAllInteractionReply(interaction);
      console.error(e);
    }
  },
} satisfies Command;

export { calc };
