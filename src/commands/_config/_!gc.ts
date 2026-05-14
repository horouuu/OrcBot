import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ComponentType,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { CommandContext } from "../../bot.types.js";
import { getExpirationEmbed } from "../../utils/funcs.js";

export const buildGcSubcommand = (opt: SlashCommandSubcommandBuilder) =>
  opt
    .setName("gc")
    .setDescription("Pick channels to be used as guild channels.");

export async function handleGc(ctx: CommandContext) {
  const { interaction, storage } = ctx;
  const resEmbed = new EmbedBuilder()
    .setTitle("Config: Guild channels")
    .setDescription(
      "Pick the channels that should be treated as guild/internal channels:",
    )
    .setColor("Green");

  const chSelect = new ChannelSelectMenuBuilder()
    .setCustomId("gcs")
    .addChannelTypes(ChannelType.GuildText)
    .setPlaceholder("Select channels")
    .setMinValues(1)
    .setMaxValues(25);

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    chSelect,
  );

  const resp = await interaction.reply({
    embeds: [resEmbed],
    components: [row],
    withResponse: true,
  });

  const collector = resp.resource?.message?.createMessageComponentCollector({
    filter: (i) => i.customId === "gcs" && i.user.id === interaction.user.id,
    time: 60000,
    componentType: ComponentType.ChannelSelect,
  });

  collector?.on("collect", async (i) => {
    const currentChannels =
      (await storage.getConfigs(["guildChannelIds"])).guildChannelIds ?? [];
    const selectedChannels = i.values;
    const newGcConfig = [...new Set([...currentChannels, ...selectedChannels])];

    await storage.setConfigs({ guildChannelIds: newGcConfig });

    const resEmbed = new EmbedBuilder()
      .setDescription(
        "Successfully set the following channels as guild channels:\n\n" +
          i.values.map((j) => `<#${j}>`).join("\n"),
      )
      .setColor("Green");
    await i.update({ embeds: [resEmbed], components: [] });
    collector.stop();
  });

  collector?.on("end", async (_, reason) => {
    if (reason === "time") {
      await interaction.editReply({
        embeds: [getExpirationEmbed()],
        components: [],
      });
    }
  });
}
