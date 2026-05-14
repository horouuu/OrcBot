import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { CommandContext } from "../../bot.types.js";

export const buildFetchPowerSubcommand = (opt: SlashCommandSubcommandBuilder) =>
  opt
    .setName("fetch")
    .setDescription("Fetch a guild member's power.")
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("The user whose power to fetch")
        .setRequired(true),
    );

export async function handleFetchPower(ctx: CommandContext) {
  const { interaction, storage } = ctx;

  const channelId = interaction.channelId;
  const allowedChannels = (await storage.getConfigs(["guildChannelIds"]))
    .guildChannelIds;

  if (!allowedChannels?.includes(channelId)) {
    const failEmbed = new EmbedBuilder()
      .setDescription("This command can only be run within guild channels.")
      .setColor("DarkRed");

    return await interaction.reply({
      embeds: [failEmbed],
      flags: [MessageFlags.Ephemeral],
    });
  }

  const user = interaction.options.getUser("user", true);
  const userId = user.id;
  const storedPower = await storage.getCurrPower(userId);
  if (!storedPower) {
    const failEmbed = new EmbedBuilder()
      .setDescription(
        "This user has not registered their power with the bot yet.\nThey can use `/power update [power] [units]` to do so.",
      )
      .setColor("DarkRed");

    return await interaction.reply({
      embeds: [failEmbed],
      flags: [MessageFlags.Ephemeral],
    });
  } else {
    const powerHistory = await storage.getPowerHistory(userId, 5);
    let powerHistoryText = `-`;
    if (powerHistory)
      powerHistoryText =
        `**History**\n` +
        powerHistory
          .map((p) => `<t:${Math.floor(p.timestamp / 1000)}:d>: ${p.power}`)
          .join("\n");

    const resEmbed = new EmbedBuilder()
      .setTitle(`${storedPower.power}`)
      .setDescription(powerHistoryText)
      .setColor("Blurple")
      .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() });

    return await interaction.reply({ embeds: [resEmbed] });
  }
}
