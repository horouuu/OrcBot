import { ConfigType } from "../utils/config";
import { Storage } from "./Storage";
import { createClient } from "redis";

enum RedisTypes {
  STRING = "string",
  SET = "set",
  HASH = "hash",
  NONE = "none",
}

type storeKeys = "petHolder";

export class RedisStorage extends Storage {
  private _client: ReturnType<typeof createClient>;

  private constructor(client: ReturnType<typeof createClient>) {
    super();
    this._client = client;
  }

  public async get(key: storeKeys): Promise<string | null> {
    try {
      const type = await this._client.type(key);
      if (type !== RedisTypes.STRING && type !== RedisTypes.NONE) {
        throw new Error(
          `ERROR: get tried to retrieve non-string value at key ${key}`,
        );
      }
      const res = await this._client.get(key);
      return res;
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("Failed to fetch from database.");
    }
  }

  public async set(key: storeKeys, value: string): Promise<void> {
    try {
      const type = await this._client.type(key);
      if (type !== RedisTypes.STRING && type !== RedisTypes.NONE)
        throw new Error(
          `ERROR: Attempted to set string value at key storing non-string value ${key}.`,
        );
      await this._client.set(key, value);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to write to database!");
    }
  }

  public async getPetHolder(): Promise<string | null> {
    return await this.get("petHolder");
  }

  public async setPetHolder(holder: string): Promise<void> {
    await this.set("petHolder", holder);
  }

  public static async create(config: ConfigType) {
    const client = createClient({ url: config.redisUrl });

    client.on("err", (e) => console.error(e));
    await client.connect();

    return new RedisStorage(client);
  }
}
