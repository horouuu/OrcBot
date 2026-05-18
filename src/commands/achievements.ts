import { SlashCommandBuilder } from "discord.js";
import { CommandContext, Command } from "../bot.types.js";
import { buildDtmSubcommandGroup, handleDtm } from "./_achievements/_dtm.js";
import { catchAllInteractionReply } from "../utils/funcs.js";

const achievementsData = new SlashCommandBuilder()
  .setName("achievements")
  .setDescription("View achievements information.")
  .addSubcommandGroup(buildDtmSubcommandGroup);

type AchievementsCommands = "dtm";

const handlers: Record<
  AchievementsCommands,
  (ctx: CommandContext) => Promise<void>
> = {
  dtm: handleDtm,
};

const achievements = {
  ...achievementsData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    const scg =
      interaction.options.getSubcommandGroup() as AchievementsCommands;
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
