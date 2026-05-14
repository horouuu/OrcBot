import { CommandContext } from "../bot.types.js";
import { EmbedBuilder, MessageFlags } from "discord.js";

const ERR_MSG_GENERIC =
  "Something went wrong in the background. Contact the developers for help.";

export type SnakeToCamel<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Lowercase<Head>}${Capitalize<SnakeToCamel<Tail>>}`
    : `${Lowercase<S>}`;

export function snakeToCamel<T extends string>(str: T): SnakeToCamel<T> {
  return str
    .split("_")
    .map((s, i) =>
      i == 0
        ? s.toLowerCase()
        : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    )
    .join("") as SnakeToCamel<T>;
}

export async function catchAllInteractionReply(
  interaction: CommandContext["interaction"],
  errMsg: string = ERR_MSG_GENERIC,
) {
  if (!errMsg) errMsg = ERR_MSG_GENERIC;
  console.error("Generic error triggered.");
  if (interaction.isRepliable()) {
    if (interaction.replied || interaction.deferred) {
      interaction.followUp(errMsg).catch((e) => console.error(e));
    } else {
      interaction
        .reply({ content: errMsg, flags: [MessageFlags.Ephemeral] })
        .catch((e) => console.error(e));
    }
  } else {
    console.error(
      "Couldn't forward error through interaction reply or follow up.",
    );
  }
}

export function getExpirationEmbed() {
  return new EmbedBuilder()
    .setDescription("Interaction expired.")
    .setColor("DarkRed");
}

export const capitalized = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export async function checkIfInAllowedChannels(ctx: CommandContext) {
  const { interaction, storage } = ctx;
  const channelId = interaction.channelId;
  const allowedChannels = (await storage.getConfigs(["guildChannelIds"]))
    .guildChannelIds;

  if (!allowedChannels?.includes(channelId)) {
    const failEmbed = new EmbedBuilder()
      .setDescription("This command can only be run within guild channels.")
      .setColor("DarkRed");

    await interaction.reply({
      embeds: [failEmbed],
      flags: [MessageFlags.Ephemeral],
    });

    return false;
  }

  return true;
}
