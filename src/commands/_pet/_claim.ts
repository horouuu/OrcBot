import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { petColors, petCommands } from "./_pet-utils.js";
import { CommandContext } from "../../bot.types.js";
import { capitalized } from "../../utils/funcs.js";

export const buildClaimPetSubcommandBuilder = (
  opt: SlashCommandSubcommandBuilder,
) =>
  opt
    .setName(petCommands.PET_CLAIM)
    .setDescription(
      "Claim a pet from its current holder, or owner if there is no holder.",
    )
    .addNumberOption((opt) =>
      opt
        .setName("id")
        .setDescription(
          "Id of the pet to claim. Use /pet list [type] to find the id of a pet.",
        )
        .setRequired(true),
    );

export async function handleClaimPet(ctx: CommandContext) {
  const { storage, interaction } = ctx;
  const petId = interaction.options.getNumber("id", true);
  const claimerId = interaction.user.id;
  const { success, pet } = await storage.claimPet(petId, claimerId);

  if (success) {
    const holderExistedDesc = `${capitalized(pet.type)} pet ${pet.id} has been moved from <@${pet.holder}> to <@${claimerId}>.`;
    const noHolderDesc = `${capitalized(pet.type)} pet ${pet.id} has been moved from its owner <@${pet.owner}> to <@${claimerId}>.`;
    const resEmbed = new EmbedBuilder()
      .setDescription(pet.holder ? holderExistedDesc : noHolderDesc)
      .setColor(petColors[pet.type])
      .setFooter({
        text: `${capitalized(pet.type)} pet ${pet.id} is owned by ${pet.owner}`,
      });
    await interaction.reply({ embeds: [resEmbed] });
  } else {
    if (pet) {
      const failEmbed = new EmbedBuilder()
        .setDescription(`You're already holding this pet!`)
        .setColor("Red");
      await interaction.reply({
        embeds: [failEmbed],
        flags: [MessageFlags.Ephemeral],
      });
    } else {
      const failEmbed = new EmbedBuilder()
        .setDescription(`Pet with id ${petId} not found.`)
        .setColor("Red");
      await interaction.reply({ embeds: [failEmbed] });
    }
  }
}
