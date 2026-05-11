import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { CommandContext } from "../bot.types.js";
import { petSubcommandGroup } from "./_pet/_pet-utils.js";
import { buildCheckPetSubcommandGroup, handleCheckPet } from "./_pet/_check.js";
import { buildSetPetSubcommandGroup, handleSetPet } from "./_pet/_set.js";
export type petKeys = "summon" | "furnace";

const petData = new SlashCommandBuilder()
  .setName("pet")
  .setDescription("Guild pet lending system.")
  .addSubcommandGroup(buildCheckPetSubcommandGroup)
  .addSubcommandGroup(buildSetPetSubcommandGroup);

const pet = {
  ...petData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;
    const cmdGroup = interaction.options.getSubcommandGroup();
    const pet = interaction.options.getSubcommand() as petKeys;

    if (cmdGroup === petSubcommandGroup.PET_CHECK) {
      await handleCheckPet({ ...cmdContext, pet });
    } else {
      const holder = interaction.options.getUser("holder");
      if (!holder) {
        await interaction.reply({
          content: "Command must include an input for: \`holder\` (User).",
          flags: MessageFlags.Ephemeral,
        });

        return;
      }
      await handleSetPet({ ...cmdContext, pet, holder });
    }
  },
};

export { pet };
