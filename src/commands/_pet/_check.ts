import {
  EmbedBuilder,
  SlashCommandSubcommandGroupBuilder,
  User,
} from "discord.js";
import { petSubcommandGroup } from "./_pet-utils.js";
import { CommandContext } from "../../bot.types.js";
import { petKeys } from "../pet.js";
import { catchAllInteractionReply } from "../../utils/funcs.js";

export const buildCheckPetSubcommandGroup = (
  opt: SlashCommandSubcommandGroupBuilder,
) =>
  opt
    .setName(petSubcommandGroup.PET_CHECK)
    .setDescription("Check who currently holds a certain pet.")
    .addSubcommand((opt) =>
      opt
        .setName("summon")
        .setDescription("Check who currently holds the summon pet."),
    )
    .addSubcommand((opt) =>
      opt
        .setName("furnace")
        .setDescription("Check who currently holds the furnace pet."),
    );

export async function handleCheckPet(ctx: CommandContext & { pet: petKeys }) {
  const { pet, interaction, storage } = ctx;
  try {
    const holderId = await storage.getPetHolder(pet);
    const resEmbed = new EmbedBuilder().setColor(
      pet === "summon" ? "Aqua" : "DarkRed",
    );
    const desc = holderId
      ? `The \`${pet}\` pet is currently held by: <@${holderId}>.`
      : `The \`${pet}\` pet is currently not held by anyone.`;

    resEmbed.setDescription(desc);
    await interaction.reply({ embeds: [resEmbed] });
  } catch (e) {
    catchAllInteractionReply(interaction);
  }
}
