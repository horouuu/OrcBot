import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { POWER_UNITS, PowerHash, PowerUnits } from "./_power-utils.js";
import { CommandContext } from "../../bot.types.js";
import { catchAllInteractionReply } from "../../utils/funcs.js";

const powerChoices = POWER_UNITS.map((p) => ({ name: p, value: p }));

export const buildUpdatePowerSubcommand = (
  opt: SlashCommandSubcommandBuilder,
) =>
  opt
    .setName("update")
    .setDescription("Update your power. Has a cooldown of 1 week.")
    .addNumberOption((opt) =>
      opt
        .setName("power")
        .setDescription("The number before the units of your power")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(99999),
    )
    .addStringOption((opt) =>
      opt
        .setName("units")
        .setDescription("The units that come after the number in your power")
        .addChoices(powerChoices)
        .setRequired(true),
    );

export async function handleUpdatePower(ctx: CommandContext) {
  const { interaction, storage } = ctx;
  try {
    const userId = interaction.user.id;
    const calledTimestamp = interaction.createdTimestamp;
    const powerNum = interaction.options.getNumber("power", true);
    const powerUnits = interaction.options.getString(
      "units",
      true,
    ) as PowerUnits;

    const newPowerHash: PowerHash = {
      value: powerNum,
      units: powerUnits,
    };

    const currStoredPower = await storage.getCurrPower(userId);
    if (currStoredPower) {
      const storedTimestamp = currStoredPower.timestamp;
      const elapsed = calledTimestamp - storedTimestamp;
      if (elapsed / (1000 * 60 * 60 * 24) < 7) {
        const nextUpdateTimestamp = storedTimestamp + 1000 * 60 * 60 * 24 * 7;
        const failEmbed = new EmbedBuilder()
          .setDescription(
            `You have already updated your power in the past 7 days.\nYou will be able to update your power again on: <t:${Math.floor(nextUpdateTimestamp / 1000)}:f>`,
          )
          .setColor("DarkRed");
        return await interaction.reply({
          embeds: [failEmbed],
          flags: [MessageFlags.Ephemeral],
        });
      }
    }

    let resDesc = `Successfully updated your power to: ${powerNum} ${powerUnits}.`;
    if (currStoredPower)
      resDesc += `\nPrevious power: ${currStoredPower.power}`;
    await storage.updatePower(userId, calledTimestamp, newPowerHash);
    const resEmbed = new EmbedBuilder()
      .setDescription(resDesc)
      .setAuthor({
        name: interaction.user.displayName,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor("Red");
    await interaction.reply({ embeds: [resEmbed] });
  } catch (e) {
    catchAllInteractionReply(interaction);
  }
}
