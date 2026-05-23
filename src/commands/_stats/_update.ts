import {
  CacheType,
  EmbedBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandSubcommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import { CommandContext } from "../../bot.types.js";
import { Stats } from "./_stats-utils.js";

export const buildUpdateStatsSubcommand = (
  opt: SlashCommandSubcommandBuilder,
) => opt.setName("update").setDescription("View the power leaderboard.");

export async function handleUpdateStats(ctx: CommandContext) {
  const { interaction } = ctx;

  const fieldData = [
    { title: "Exp Gain Rate", id: "egr" },
    { title: "Gold Drop Rate", id: "gdr" },
    { title: "Extra Exp Drop", id: "eed" },
    { title: "Extra Gold Drop", id: "egd" },
    { title: "Ore Drop Rate", id: "odr" },
  ] satisfies { title: string; id: keyof Stats }[];

  const handleModalSubmission = async (
    ctx: CommandContext,
    submitted: ModalSubmitInteraction<CacheType>,
  ) => {
    const { interaction, storage } = ctx;

    const data = {} as Stats;

    for (const { id } of fieldData) {
      const raw = submitted.fields.getTextInputValue(id);
      const val = Number(raw.replaceAll("%", ""));

      if (!Number.isFinite(val)) {
        const failEmbed = new EmbedBuilder()
          .setDescription(`Invalid field: ${id}: ${val} is not a valid number.`)
          .setColor("DarkRed");

        return await submitted.reply({
          embeds: [failEmbed],
          flags: [MessageFlags.Ephemeral],
        });
      }

      data[id] = val;
    }

    await storage.updateStats(interaction.user.id, data);

    const statsText = fieldData
      .map(
        (d) =>
          `${d.title}: ${data[d.id]}${d.title.toLocaleLowerCase().includes("rate") ? "%" : ""}`,
      )
      .join("\n");

    const resEmbed = new EmbedBuilder()
      .setDescription(
        `Successfully updated your stats as the following:\n\`\`\`\n${statsText}\n\`\`\``,
      )
      .setColor("Red");

    await submitted.reply({
      embeds: [resEmbed],
      flags: [MessageFlags.Ephemeral],
    });
  };

  const fields = fieldData.map((d) =>
    new LabelBuilder()
      .setLabel(d.title)
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId(d.id)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Enter a number..."),
      ),
  );

  const modal = new ModalBuilder()
    .setCustomId("statsModal")
    .setTitle("Enter Stats");

  fields.forEach((f) => modal.addLabelComponents(f));

  await interaction.showModal(modal);

  try {
    const submitted = await interaction.awaitModalSubmit({
      time: 60 * 1000,
      filter: (i) =>
        i.customId === "statsModal" && i.user.id === interaction.user.id,
    });

    await handleModalSubmission(ctx, submitted);
  } catch {
    const expiredEmbed = new EmbedBuilder()
      .setDescription("Stat update menu expired. Please run the command again.")
      .setColor("Red");

    await interaction.followUp({
      embeds: [expiredEmbed],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
