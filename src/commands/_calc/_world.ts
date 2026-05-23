import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { CommandContext } from "../../bot.types.js";
import { capitalized } from "../../utils/funcs.js";
import { worlds } from "./_calc-utils.js";

export const buildCalcWorldSubcommand = (opt: SlashCommandSubcommandBuilder) =>
  opt
    .setName("world")
    .setDescription("Calculate Exp, Gold, and Ore per hour using your stats.")
    .addNumberOption((opt) =>
      opt
        .setName("world")
        .setDescription("World number to calculate stats for")
        .setMinValue(1)
        .setMaxValue(130)
        .setRequired(true),
    )
    .addNumberOption((opt) =>
      opt
        .setName("time")
        .setDescription("The time in seconds at which you clear this world in")
        .setRequired(true)
        .setMinValue(1),
    );

export async function handleCalcWorld(ctx: CommandContext) {
  const { storage, interaction } = ctx;
  const world = interaction.options.getNumber("world", true);
  const worldStats = worlds[world - 1];
  const time = interaction.options.getNumber("time", true);

  const stats = await storage.getStats(interaction.user.id);

  const egrMult = Math.max(1, stats.egr / 100);
  const gdrMult = Math.max(1, stats.gdr / 100);
  //const odrMult = 1 + stats.odr / 100;

  const expPerClear = egrMult * worldStats.exp + 460 * stats.eed;
  const goldPerClear = gdrMult * worldStats.gold + 460 * stats.egd;
  const expPerHour = Math.floor(expPerClear * (3600 / (time + 5)));
  const goldPerHour = Math.floor(goldPerClear * (3600 / (time + 5)));

  const expPerDay = expPerHour * 24;
  const goldPerDay = goldPerHour * 24;

  const res = `Exp/hr: ${expPerHour.toLocaleString()}\nExp/day: ${expPerDay.toLocaleString()}\n\nGold/hr: ${goldPerHour.toLocaleString()}\nGold/day: ${goldPerDay.toLocaleString()}`;
  const embedText = `**Rates**\n${res}\n\n**Your stats**\nClear time: ${time} seconds\n\nExp Gain Rate: ${stats.egr}%\nGold Drop Rate: ${stats.gdr}%\nExtra Exp Drop: ${stats.eed}\nExtra Gold Drop: ${stats.egd}`;

  const resEmbed = new EmbedBuilder()
    .setTitle(`Calculations for World ${world}`)
    .setDescription(embedText)
    .setColor("Red")
    .setFooter({ text: "Use /stats update to update your stats." })
    .setAuthor({
      name: interaction.user.displayName,
      iconURL: interaction.user.displayAvatarURL(),
    });

  await interaction.reply({ embeds: [resEmbed] });
}
