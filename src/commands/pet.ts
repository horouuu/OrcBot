import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { CommandContext } from "../bot.types.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
export type petKeys = "summon" | "furnace";

enum petSubcommandGroup {
  PET_CHECK = "check",
  PET_SET = "set",
}

const petData = new SlashCommandBuilder()
  .setName("pet")
  .setDescription("Check who currently has the pet.")
  .addSubcommandGroup((opt) =>
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
      ),
  )
  .addSubcommandGroup((opt) =>
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
      ),
  );

async function handleSet(ctx: CommandContext & { pet: petKeys; holder: User }) {
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

async function handleCheck(ctx: CommandContext & { pet: petKeys }) {
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

const pet = {
  ...petData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;
    const cmdGroup = interaction.options.getSubcommandGroup();
    const pet = interaction.options.getSubcommand() as petKeys;

    if (cmdGroup === petSubcommandGroup.PET_CHECK) {
      await handleCheck({ ...cmdContext, pet });
    } else {
      const holder = interaction.options.getUser("holder");
      if (!holder) {
        await interaction.reply({
          content: "Command must include an input for: \`holder\` (User).",
          flags: MessageFlags.Ephemeral,
        });

        return;
      }
      await handleSet({ ...cmdContext, pet, holder });
    }
  },
};

export { pet };
