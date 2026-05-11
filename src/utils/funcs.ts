import { CommandContext } from "../bot.types.js";
import { MessageFlags } from "discord.js";

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
