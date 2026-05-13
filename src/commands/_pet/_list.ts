import { Embed, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { petColors, petCommands, PetType } from "./_pet-utils.js";
import { CommandContext } from "../../bot.types.js";
import { capitalized } from "../../utils/funcs.js";

const typeChoices: { name: string; value: PetType }[] = [
  {
    name: "Furnace",
    value: "furnace",
  },
  {
    name: "Summon",
    value: "summon",
  },
  { name: "Altar", value: "altar" },
];

export const buildListPetSubcommandBuilder = (
  opt: SlashCommandSubcommandBuilder,
) =>
  opt
    .setName(petCommands.PET_LIST)
    .setDescription("List pets of a certain type, or all pets.")
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("Type of pet to list. Select 'all' to list all pets.")
        .addChoices([...typeChoices, { name: "All", value: "all" }])
        .setRequired(true),
    );

export async function handleListPet(ctx: CommandContext) {
  const { storage, interaction } = ctx;
  const petType = interaction.options.getString("type", true) as
    | PetType
    | "all";
  const pets = await storage.listPets(petType);
  console.log(pets);
  if (pets.length > 0) {
    const resEmbed = new EmbedBuilder()
      .setTitle(`All ${petType !== "all" ? `${petType} ` : ""}pets`)
      .setColor(petType !== "all" ? petColors[petType] : "Green")
      .setFooter({
        text: "Use /pet claim [petId] to claim a pet from another holder, or its owner when there is no holder.",
      });

    if (petType === "all") {
      resEmbed.setFields(
        (["summon", "furnace", "altar"] as PetType[]).map((i) => ({
          name: capitalized(i),
          value: pets
            .filter((j) => j.type === i)
            .map(
              (j) =>
                `Pet ${j.id}\nOwner: <@${j.owner}>\nCurrent holder: ${j.holder ? `<@${j.holder}>` : "-"}`,
            )
            .join("\n\n"),
          inline: true,
        })),
      );
    } else {
      resEmbed.setFields(
        pets.map((i) => ({
          name: `Pet ${i.id}`,
          value: `Owner: <@${i.owner}>\nCurrent holder: ${i.holder ? `<@${i.holder}>` : "-"}`,
        })),
      );
    }

    await interaction.reply({ embeds: [resEmbed] });
  } else {
    const emptyEmbed = new EmbedBuilder()
      .setDescription("There are currently no pets registered.")
      .setColor("Red");

    await interaction.reply({ embeds: [emptyEmbed] });
  }
}
