import { SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types.js";
import { buildDtmSubcommandGroup, handleDtm } from "./_achievements/_dtm.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
import { AchKeys } from "./_achievements/_achievements-utils.js";

const achievementsData = new SlashCommandBuilder()
  .setName("achievements")
  .setDescription("View achievements information.")
  .addSubcommandGroup(buildDtmSubcommandGroup);

const handlers: Record<AchKeys, (ctx: CommandContext) => Promise<void>> = {
  dtm: handleDtm,
};

const achievements = {
  ...achievementsData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    const scg = interaction.options.getSubcommandGroup() as AchKeys;
    if (!interaction.isChatInputCommand()) return;
    try {
      await handlers[scg](cmdContext);
    } catch (e) {
      catchAllInteractionReply(interaction);
      console.error("[Achievements]", e);
    }
  },
} satisfies Command;

export { achievements };
