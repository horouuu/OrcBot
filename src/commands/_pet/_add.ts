import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { petColors, petCommands, PetType } from "./_pet-utils.js";
import { CommandContext } from "../../bot.types.js";

const addChoices: { name: string; value: PetType }[] = [
  {
    name: "Furnace",
    value: "furnace",
  },
  {
    name: "Summon",
    value: "summon",
  },
  {
    name: "Altar",
    value: "altar",
  },
];

export const buildAddPetSubcommandBuilder = (
  opt: SlashCommandSubcommandBuilder,
) =>
  opt
    .setName(petCommands.PET_ADD)
    .setDescription("Add a pet.")
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("Type of pet to add")
        .setChoices(addChoices)
        .setRequired(true),
    )
    .addUserOption((opt) =>
      opt
        .setName("owner")
        .setDescription("The owner of the pet")
        .setRequired(true),
    );

export async function handleAddPet(ctx: CommandContext) {
  const { storage, interaction } = ctx;
  const petType = interaction.options.getString("type", true) as PetType;
  const owner = interaction.options.getUser("owner", true);

  await storage.addPet(petType, owner.id);
  const resEmbed = new EmbedBuilder()
    .setDescription("Successfully added new pet:")
    .setFields([
      { name: "Type", value: petType },
      { name: "Owner", value: `<@${owner.id}>` },
    ])
    .setColor(petColors[petType]);

  await interaction.reply({ embeds: [resEmbed] });
}
