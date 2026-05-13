import { SlashCommandBuilder } from "discord.js";
import { CommandContext } from "../bot.types.js";
import { petCommands } from "./_pet/_pet-utils.js";
import { buildSetPetSubcommandGroup, handleSetPet } from "./_pet/_set.js";
import { PetType } from "./_pet/_pet-utils.js";
import { buildAddPetSubcommandBuilder, handleAddPet } from "./_pet/_add.js";
import { buildDelPetSubcommandBuilder, handleDelPet } from "./_pet/_del.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
import { buildListPetSubcommandBuilder, handleListPet } from "./_pet/_list.js";
import {
  buildClaimPetSubcommandBuilder,
  handleClaimPet,
} from "./_pet/_claim.js";

const petData = new SlashCommandBuilder()
  .setName("pet")
  .setDescription("Guild pet lending system.")
  .addSubcommandGroup(buildSetPetSubcommandGroup)
  .addSubcommand(buildAddPetSubcommandBuilder)
  .addSubcommand(buildDelPetSubcommandBuilder)
  .addSubcommand(buildListPetSubcommandBuilder)
  .addSubcommand(buildClaimPetSubcommandBuilder);

const handlers = {
  [petCommands.PET_ADD]: handleAddPet,
  [petCommands.PET_SET]: handleSetPet,
  [petCommands.PET_DEL]: handleDelPet,
  [petCommands.PET_LIST]: handleListPet,
  [petCommands.PET_CLAIM]: handleClaimPet,
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
      console.error(e);
      catchAllInteractionReply(interaction);
    }
  },
};

export { pet };
