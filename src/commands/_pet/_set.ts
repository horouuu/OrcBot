import {
  User,
  EmbedBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import { CommandContext } from "../../bot.types.js";
import { catchAllInteractionReply } from "../../utils/funcs.js";
import { petKeys } from "../pet.js";
import { petSubcommandGroup } from "./_pet-utils.js";

export const buildSetPetSubcommandGroup = (
  opt: SlashCommandSubcommandGroupBuilder,
) =>
  opt
    .setName(petSubcommandGroup.PET_SET)
    .setDescription("Update the current pet holder.")
    .addSubcommand((opt) =>
      opt
        .setName("summon")
        .setDescription("Update the summon pet's holder.")
        .addUserOption((opt) =>
          opt
            .setName("holder")
            .setDescription("Name of the new holder of this pet.")
            .setRequired(true),
        ),
    )
    .addSubcommand((opt) =>
      opt
        .setName("furnace")
        .setDescription("Update the furnace pet's holder.")
        .addUserOption((opt) =>
          opt
            .setName("holder")
            .setDescription("Name of the new holder of this pet.")
            .setRequired(true),
        ),
    );

export async function handleSetPet(
  ctx: CommandContext & { pet: petKeys; holder: User },
) {
  const { pet, holder, interaction, storage } = ctx;
  try {
    await storage.setPetHolder(pet, holder.id);
    const resEmbed = new EmbedBuilder()
      .setColor(pet === "summon" ? "Aqua" : "DarkRed")
      .setDescription(`The ${pet} pet's holder is now: <@${holder.id}>.`);
    await interaction.reply({
      embeds: [resEmbed],
    });
  } catch (e) {
    catchAllInteractionReply(interaction);
  }
}
