import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { ConfigType } from "./utils/config.js";
import Storage from "./storage/Storage.js";

export type HandlerContext = {
  client: Client<boolean>;
  config: ConfigType;
  storage: Storage;
};

export type CommandContext = {
  interaction: ChatInputCommandInteraction<CacheType>;
  config: ConfigType;
  storage: Storage;
};

export type CommandContextRequire<
  Ctx extends CommandContext,
  Keys extends keyof Ctx = never,
> = Omit<Ctx, Keys> & Required<Pick<Ctx, Keys>>;

export interface Command extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  execute(commandCtx: CommandContextRequire<CommandContext>): Promise<void>;
  execute(commandCtx: CommandContext): Promise<void>;
}
