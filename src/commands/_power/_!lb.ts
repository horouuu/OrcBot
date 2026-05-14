import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";

import { CommandContext } from "../../bot.types.js";
import { checkIfInAllowedChannels } from "../../utils/funcs.js";

const unitsMap = {
  M: 1,
  B: 2,
  T: 3,
  Qa: 4,
  Qn: 5,
};

function convertUnits(powerText: string) {}

export const buildLbSubcommand = (opt: SlashCommandSubcommandBuilder) =>
  opt.setName("lb").setDescription("View the power leaderboard.");

export async function handleLb(ctx: CommandContext) {
  const { interaction, storage } = ctx;

  if (!(await checkIfInAllowedChannels(ctx))) return;

  const allStoredPower = await storage.getAllCurrentPower();
  const sortedPower = allStoredPower
    .sort((a, b) => {
      const aPwr = Number(a[1].power.split(" ")[0]);
      const bPwr = Number(b[1].power.split(" ")[0]);

      const aUnits = a[1].power.split(" ")[1];
      const bUnits = b[1].power.split(" ")[1];

      const normalizeA = Math.floor(aPwr / 1000) > 0 ? 1 : 0;
      const normalizeB = Math.floor(bPwr / 1000) > 0 ? 1 : 0;

      const aRank = unitsMap[aUnits as keyof typeof unitsMap] + normalizeA;
      const bRank = unitsMap[bUnits as keyof typeof unitsMap] + normalizeB;

      const finalAPwr = aPwr / (normalizeA ? 1000 : 1);
      const finalBPwr = bPwr / (normalizeB ? 1000 : 1);

      if (aRank !== bRank) return bRank - aRank;
      return finalBPwr - finalAPwr;
    })
    .map(
      (i, j) =>
        `${j}. **${i[1].power}** - <@${i[0]}> (<t:${Math.floor(i[1].timestamp / 1000)}:d>)`,
    );

  const lbText =
    sortedPower.length > 0
      ? sortedPower.join("\n")
      : "There is currently no one on the leaderboard.";

  const resEmbed = new EmbedBuilder()
    .setTitle("TheOrcs: Power Leaderboard")
    .setDescription(lbText)
    .setColor("Red");

  await interaction.reply({ embeds: [resEmbed] });
}
