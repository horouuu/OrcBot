import { SlashCommandBuilder } from "discord.js";
import { CommandContext } from "../bot.types.js";
import { petCommands } from "./_pet/_pet-utils.js";
import { buildSetPetSubcommand, handleSetPet } from "./_pet/_set.js";
import { PetType } from "./_pet/_pet-utils.js";
import {
  buildAddPetSubcommandBuilder as buildAddPetSubcommand,
  handleAddPet,
} from "./_pet/_add.js";
import {
  buildDelPetSubcommandBuilder as buildDelPetSubcommand,
  handleDelPet,
} from "./_pet/_del.js";
import { catchAllInteractionReply } from "../utils/funcs.js";
import {
  buildListPetSubcommandBuilder as buildListPetSubcommand,
  handleListPet,
} from "./_pet/_list.js";
import {
  buildClaimPetSubcommandBuilder as buildClaimPetSubcommand,
  handleClaimPet,
} from "./_pet/_claim.js";

const petData = new SlashCommandBuilder()
  .setName("pet")
  .setDescription("Guild pet lending system.")
  .addSubcommand(buildSetPetSubcommand)
  .addSubcommand(buildAddPetSubcommand)
  .addSubcommand(buildDelPetSubcommand)
  .addSubcommand(buildListPetSubcommand)
  .addSubcommand(buildClaimPetSubcommand);

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
    if (!cmdGroup)
      cmdGroup = interaction.options.getSubcommand() as petCommands;

    try {
      await handlers[cmdGroup]({ ...cmdContext });
    } catch (e) {
      console.error(e);
      catchAllInteractionReply(interaction);
    }
  },
};

export { pet };
