import { EmbedBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { CommandContext } from "../../bot.types.js";
import { toText, uniquePetsData } from "./_achievements-utils.js";
import { eggsOpenedData } from "./_achievements-utils.js";
export const buildDtmSubcommandGroup = (
  opt: SlashCommandSubcommandGroupBuilder,
) =>
  opt
    .setName("dtm")
    .setDescription("All DTM-related achievements.")
    .addSubcommand((opt) =>
      opt.setName("list").setDescription("List all DTM-related achievements."),
    );

async function handleDtmList(ctx: CommandContext) {
  const { storage, interaction } = ctx;
  const userId = interaction.user.id;

  const uniquePetsTotalDtm = uniquePetsData
    .map((d) => d.reward)
    .reduce((p, c) => p + c);

  const eggsOpenedTotalDtm = eggsOpenedData
    .map((d) => d.reward)
    .reduce((p, c) => p + c);
  const uniquePetsText =
    toText(uniquePetsData) + `\n\nTotal: ${uniquePetsTotalDtm.toFixed(2)}%`;
  const eggsOpenedText =
    toText(eggsOpenedData) + `\n\nTotal: ${eggsOpenedTotalDtm.toFixed(2)}%`;

  const listEmbed = new EmbedBuilder()
    .setTitle("Achievements")
    .setDescription("Achievements related to the DTM stat")
    .setFields([
      {
        name: "Hatch unique pets",
        value: `\`\`\`txt\n${uniquePetsText}\n\`\`\``,
        inline: true,
      },
      {
        name: "Open pet eggs",
        value: `\`\`\`txt\n${eggsOpenedText}\n\`\`\``,
        inline: true,
      },
    ])
    .setFooter({
      text: "If any data is outdated, please notify godsel on Discord.",
    })
    .setColor("Red");

  await interaction.reply({ embeds: [listEmbed] });
}

type DtmCommands = "list";

const handlers: Record<DtmCommands, (ctx: CommandContext) => Promise<void>> = {
  list: handleDtmList,
};

export async function handleDtm(ctx: CommandContext) {
  const { storage, interaction } = ctx;
  const sc = interaction.options.getSubcommand() as DtmCommands;
  await handlers[sc](ctx);
}
