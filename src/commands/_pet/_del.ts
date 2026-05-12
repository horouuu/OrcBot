import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { petColors, petCommands, PetType } from "./_pet-utils.js";
import { CommandContext } from "../../bot.types.js";

export const buildDelPetSubcommandBuilder = (
  opt: SlashCommandSubcommandBuilder,
) =>
  opt
    .setName(petCommands.PET_DEL)
    .setDescription("Delete a pet.")
    .addNumberOption((opt) =>
      opt.setName("id").setDescription("Id of pet to delete").setRequired(true),
    );

export async function handleDelPet(ctx: CommandContext) {
  const { storage, interaction } = ctx;
  const petId = interaction.options.getNumber(petCommands.PET_DEL, true);
  const { success, pet } = await storage.delPet(petId);

  if (success) {
    const resEmbed = new EmbedBuilder()
      .setDescription("Successfully deleted pet:")
      .setFields([
        { name: "Id", value: pet.id.toString() },
        { name: "Type", value: pet.type },
        { name: "Owner", value: `<@${pet.owner}>` },
        {
          name: "Last known holder",
          value: pet.holder ? `<@${pet.holder}>` : "None",
        },
      ])
      .setColor(petColors[pet.type]);
    await interaction.reply({ embeds: [resEmbed] });
  } else {
    const failEmbed = new EmbedBuilder()
      .setDescription(`Pet with id ${petId} not found.`)
      .setColor("Red");

    await interaction.reply({ embeds: [failEmbed] });
  }
}
