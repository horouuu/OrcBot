import { Client, Events, Partials, GatewayIntentBits } from "discord.js";
import { Config } from "./utils/config.js";
import { HandlerContext } from "./bot.types.js";
import { commandHandler, initCommands } from "./command-handler.js";
import { RedisStorage } from "./storage/RedisStorage.js";

const config = new Config();
const storage = await RedisStorage.create(config);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const handlerCtx: HandlerContext = { client, config, storage };

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`OrcBot successfully logged in as ${readyClient.user.tag}!`);
});

const commands = await initCommands(config);
client.on(Events.InteractionCreate, (interaction) => {
  commandHandler(interaction, commands, handlerCtx);
});

client.login(config.token);
