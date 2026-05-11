import { SlashCommandBuilder } from "discord.js";
import { CommandContext } from "../bot.types.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
export type petKeys = "summon" | "furnace";

enum petSubcommandGroup {
  PET_CHECK = "check",
  PET_SET = "set",
}

const petData = new SlashCommandBuilder()
  .setName(petSubcommandGroup.PET_CHECK)
  .setDescription("Check who currently has the pet.")
  .addSubcommandGroup((opt) =>
    opt
      .setName("check")
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
          .addStringOption((opt) =>
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
          .addStringOption((opt) =>
            opt
              .setName("holder")
              .setDescription("Name of the new holder of this pet.")
              .setRequired(true),
          ),
      ),
  );

async function handleSet(
  ctx: CommandContext & { pet: petKeys; holder: string },
) {
  const { pet, holder, interaction, storage } = ctx;
  try {
    await storage.setPetHolder(pet, holder);
    await interaction.reply(
      `Holder of the ${pet} pet has been set to: \`${holder}\``,
    );
  } catch (e) {
    catchAllInteractionReply(interaction);
  }
}

async function handleCheck(ctx: CommandContext & { pet: petKeys }) {
  const { pet, interaction, storage } = ctx;
  try {
    const holder = await storage.getPetHolder(pet);
    const res = holder
      ? `The pet is currently held by: \`${holder}\`.`
      : `The pet is currently not held by anyone.`;
    await interaction.reply(res);
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
      const holder = interaction.options.getString("holder") ?? "";
      await handleSet({ ...cmdContext, pet, holder });
    }
  },
};

export { pet };
