import { SlashCommandBuilder } from "discord.js";
import { CommandContext } from "../bot.types.js";
import { petCommands } from "./_pet/_pet-utils.js";
import { buildCheckPetSubcommandGroup, handleCheckPet } from "./_pet/_check.js";
import { buildSetPetSubcommandGroup, handleSetPet } from "./_pet/_set.js";
import { PetType } from "./_pet/_pet-utils.js";
import { buildAddPetSubcommandBuilder, handleAddPet } from "./_pet/_add.js";
import { handleDelPet } from "./_pet/_del.js";
import { catchAllInteractionReply } from "../utils/funcs.js";

const petData = new SlashCommandBuilder()
  .setName("pet")
  .setDescription("Guild pet lending system.")
  .addSubcommandGroup(buildCheckPetSubcommandGroup)
  .addSubcommandGroup(buildSetPetSubcommandGroup)
  .addSubcommand(buildAddPetSubcommandBuilder);

const handlers = {
  [petCommands.PET_ADD]: handleAddPet,
  [petCommands.PET_CHECK]: handleCheckPet,
  [petCommands.PET_SET]: handleSetPet,
  [petCommands.PET_DEL]: handleDelPet,
};

const pet = {
  ...petData.toJSON(),
  execute: async (cmdContext: CommandContext) => {
    const { interaction } = cmdContext;
    if (!interaction.isChatInputCommand()) return;
    let cmdGroup = interaction.options.getSubcommandGroup() as petCommands;
    const pet = interaction.options.getSubcommand() as PetType;

    if (!cmdGroup)
      cmdGroup = interaction.options.getSubcommand() as petCommands;

    try {
      await handlers[cmdGroup]({ ...cmdContext, pet });
    } catch (e) {
      catchAllInteractionReply(interaction);
    }
  },
};

export { pet };
