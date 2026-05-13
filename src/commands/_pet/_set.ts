import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { CommandContext } from "../../bot.types.js";
import { petColors } from "./_pet-utils.js";
import { petCommands } from "./_pet-utils.js";
import { capitalized } from "../../utils/funcs.js";

export const buildSetPetSubcommand = (opt: SlashCommandSubcommandBuilder) =>
  opt
    .setName(petCommands.PET_SET)
    .setDescription("Update the current pet holder of the pet.")
    .addNumberOption((opt) =>
      opt
        .setName("id")
        .setDescription("The id of the pet whose holder is to be changed")
        .setRequired(true),
    )
    .addUserOption((opt) =>
      opt
        .setName("holder")
        .setDescription("New holder of the pet")
        .setRequired(true),
    );

export async function handleSetPet(ctx: CommandContext) {
  const { interaction, storage } = ctx;
  const petId = interaction.options.getNumber("id", true);
  const holder = interaction.options.getUser("holder", true);
  const { success, pet } = await storage.claimPet(petId, holder.id);

  if (!pet) {
    const failEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription(`Pet with id ${petId} not found.`);
    await interaction.reply({
      embeds: [failEmbed],
    });
  } else {
    if (success) {
      const resEmbed = new EmbedBuilder()
        .setColor(petColors[pet.type])
        .setDescription(
          `${capitalized(pet.type)} pet ${pet.id} is now held by ${holder}.`,
        );

      await interaction.reply({
        embeds: [resEmbed],
      });
    } else {
      const sameHolderEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          `${holder} is already in possession of ${pet.type} pet ${pet.id}.`,
        );

      await interaction.reply({
        embeds: [sameHolderEmbed],
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}
