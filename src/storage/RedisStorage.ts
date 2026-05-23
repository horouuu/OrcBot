import { ConfigType } from "../utils/config.js";
import Storage from "./Storage.js";
import { createClient } from "redis";
import { parsePetHash, PetHash, PetType } from "../commands/_pet/_pet-utils.js";
import {
  isPowerString,
  PowerData,
  PowerHash,
  PowerString,
} from "../commands/_power/_power-utils.js";
import { ConfigHash, ConfigKeys } from "../commands/_config/_config-utils.js";
import {
  AchData,
  AchKeys,
  parseAchData,
} from "../commands/_achievements/_achievements-utils.js";
import { parseStats, Stats } from "../commands/_stats/_stats-utils.js";
import { isThisTypeNode } from "typescript";

enum RedisTypes {
  STRING = "string",
  SET = "set",
  HASH = "hash",
  NONE = "none",
}

const RedisKeys = {
  pets: (id: number) => `pets:list:${id}`,
  petSet: (type: PetType) => `pets:type:${type}`,
  petId: () => `pets:id`,
  memPowerHistory: (memId: string) => `members:${memId}:power:history`,
  memPowerCurrent: (memId: string) => `members:${memId}:power:current`,
  memIndex: () => `members:index`,
  configs: () => `configs`,
  achievement: (memId: string, achKey: AchKeys) => `members:${memId}:${achKey}`,
  stats: (memId: string) => `members:${memId}:stats`,
};

function createNewPet(id: number, type: PetType, owner: string): PetHash {
  return {
    id,
    type,
    owner,
    holder: "",
  };
}

function parseStoredPower(inp: Record<string, string>): PowerData | null {
  if (!inp.timestamp || !inp.power) return null;
  if (!isPowerString(inp.power)) return null;

  return {
    timestamp: Number(inp.timestamp),
    power: inp.power,
  };
}

const configParsers = {
  guildChannelIds: (inp: string): string[] | null => {
    try {
      const arr = JSON.parse(inp);

      if (!Array.isArray(arr)) return null;

      return arr.filter((v): v is string => typeof v === "string");
    } catch {
      return null;
    }
  },
} satisfies {
  [K in ConfigKeys]: (inp: string) => ConfigHash[K] | null;
};

function parseConfigKey(key: string): ConfigKeys | null {
  if (key in configParsers) {
    return key as ConfigKeys;
  }

  return null;
}

function parseConfig<K extends ConfigKeys>(
  key: K,
  inp: string,
): ConfigHash[K] | null {
  return configParsers[key](inp);
}

function parseConfigs(
  rawObj: Record<string, string | null>,
): Partial<ConfigHash> {
  const parsed: Partial<ConfigHash> = {};
  for (const [key, val] of Object.entries(rawObj)) {
    if (!val) continue;
    const parsedKey = parseConfigKey(key);
    if (!parsedKey) continue;

    const parsedVal = parseConfig(parsedKey, val);
    if (!parsedVal) continue;

    parsed[parsedKey] = parsedVal;
  }

  return parsed;
}

type storeKeys = PetType;

export class RedisStorage extends Storage {
  private _client: ReturnType<typeof createClient>;

  public static async create(config: ConfigType) {
    const client = createClient({ url: config.redisUrl });

    client.on("err", (e) => console.error(e));
    await client.connect();

    return new RedisStorage(client);
  }

  private constructor(client: ReturnType<typeof createClient>) {
    super();
    this._client = client;
  }

  private async _get(key: string): Promise<string | null> {
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

  private async _set(key: storeKeys, value: string): Promise<void> {
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

  private async _del(key: string): Promise<number> {
    try {
      return await this._client.del(key);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[_del] failed to delete key from database.");
    }
  }

  private async _checkType(key: string, type: RedisTypes, notNull = true) {
    const t = await this._client.type(key);
    if (t !== type && (t !== RedisTypes.NONE || !notNull)) return true;
    return false;
  }

  private async _hSet<T extends Record<string | number, any>>(
    key: string,
    obj: T,
  ) {
    try {
      if (!this._checkType(key, RedisTypes.HASH)) {
        throw new Error(
          `ERROR: Attempted to set hash value at key storing non-hash value ${key}.`,
        );
      }
      await this._client.hSet(key, obj);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to write to database!");
    }
  }

  private async _hGet(key: string, field: string) {
    try {
      if (!this._checkType(key, RedisTypes.HASH)) {
        throw new Error(
          `ERROR: Attempted to get hash value at key storing non-hash value ${key}`,
        );
      }

      return await this._client.hGet(key, field);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to write to database!");
    }
  }

  private async _hGetAll(key: string) {
    try {
      if (!this._checkType(key, RedisTypes.HASH)) {
        throw new Error(
          `ERROR: Attempted to get hash value at key storing non-hash value ${key}.`,
        );
      }
      return await this._client.hGetAll(key);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("Failed to write to database!");
    }
  }

  private async _sAdd(key: string, members: string | string[]): Promise<void> {
    try {
      const type = await this._client.type(key);
      if (type !== RedisTypes.SET && type !== RedisTypes.NONE)
        throw new Error(
          `ERROR: sAdd tried to add set item to non-set store (${type}) at key ${key}`,
        );

      await this._client.sAdd(key, members);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to write to database!");
    }
  }

  private async _sRem(key: string, members: string): Promise<number> {
    try {
      const type = await this._client.type(key);
      if (type !== RedisTypes.SET)
        throw new Error(
          `ERROR: sRem Attempted to remove set item from key storing non-set value at key ${key}.`,
        );

      return await this._client.sRem(key, members);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to write to database!");
    }
  }

  private async _sGet(key: string): Promise<string[]> {
    try {
      const type = await this._client.type(key);
      if (type !== RedisTypes.SET)
        throw new Error(
          `ERROR: sGet tried to retrieve non-set item at key ${key}`,
        );
      return await this._client.sMembers(key);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to fetch from database!");
    }
  }

  public async addPet(type: PetType, owner: string) {
    try {
      const id = await this._client.incr(RedisKeys.petId());
      const newPet = createNewPet(id, type, owner);

      await this._hSet(RedisKeys.pets(id), newPet);
      await this._sAdd(RedisKeys.petSet(type), id.toString());
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[addPet] Failed to write to database.");
    }
  }

  public async delPet(
    id: number,
  ): Promise<{ success: true; pet: PetHash } | { success: false; pet: null }> {
    try {
      const key = RedisKeys.pets(id);
      const petData = await this._hGetAll(key);
      const pet = parsePetHash(petData);
      console.log(petData);
      console.log(pet);
      if (pet) {
        await this._del(key);
        await this._sRem(RedisKeys.petSet(pet.type), id.toString());
        return { success: true, pet };
      } else {
        return { success: false, pet: null };
      }
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[delPet] Failed to delete pet from database.");
    }
  }

  public async listPets(type: PetType | "all") {
    try {
      const pipeline = this._client.multi();
      const ids =
        type === "all"
          ? await this._client.sUnion([
              RedisKeys.petSet("altar"),
              RedisKeys.petSet("summon"),
              RedisKeys.petSet("furnace"),
            ])
          : await this._sGet(RedisKeys.petSet(type));

      console.log(ids);
      for (const id of ids) {
        pipeline.hGetAll(RedisKeys.pets(Number(id)));
      }

      const res = (await pipeline.exec()) as unknown as Record<
        string,
        string
      >[];

      console.log(res);

      if (res) {
        return res.map(parsePetHash).filter((i) => i !== null);
      } else {
        return [];
      }
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[listPets] Error.");
    }
  }

  public async claimPet(
    petId: number,
    userId: string,
  ): Promise<
    { success: false; pet: PetHash | null } | { success: true; pet: PetHash }
  > {
    try {
      const pet = await this._hGetAll(RedisKeys.pets(petId));
      const parsedPet = parsePetHash(pet);
      if (!parsedPet) {
        return { success: false, pet: null };
      } else {
        if (parsedPet.holder === userId)
          return { success: false, pet: parsedPet };
        await this._hSet(RedisKeys.pets(petId), { holder: userId });
        return { success: true, pet: parsedPet };
      }
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[claimPet] Error.");
    }
  }

  public async updatePower(
    memberId: string,
    timestamp: number,
    power: PowerHash,
  ): Promise<void> {
    try {
      const currentKey = RedisKeys.memPowerCurrent(memberId);
      const historyKey = RedisKeys.memPowerHistory(memberId);
      const powerString: PowerString = `${power.value} ${power.units}`;

      await this._hSet(currentKey, { timestamp, power: powerString });
      await this._sAdd(RedisKeys.memIndex(), memberId);
      await this._client.zAdd(historyKey, {
        score: timestamp,
        value: powerString,
      });
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[updatePower] Error.");
    }
  }

  public async getCurrPower(memberId: string): Promise<PowerData | null> {
    try {
      const currentKey = RedisKeys.memPowerCurrent(memberId);
      const res = await this._hGetAll(currentKey);
      const storedPower = parseStoredPower(res);
      if (!storedPower) return null;
      return storedPower;
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[getCurrPower] Error.");
    }
  }

  public async getPowerHistory(
    memberId: string,
    size: number,
  ): Promise<PowerData[] | null> {
    try {
      const historyKey = RedisKeys.memPowerHistory(memberId);
      const res = await this._client.zRangeWithScores(historyKey, 0, size - 1);
      if (res.length === 0) return null;

      const powerDataArr = res
        .map((i) =>
          parseStoredPower({
            timestamp: i.score.toString(),
            power: i.value,
          }),
        )
        .filter((k) => k !== null);

      if (powerDataArr.length === 0) return null;
      return powerDataArr;
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[getPowerHistory] Error.");
    }
  }

  public async getConfigs(
    configs?: ConfigKeys[],
  ): Promise<Partial<ConfigHash>> {
    try {
      const key = RedisKeys.configs();
      let rawConfigs: Record<string, string | null> = {};

      if (!configs) {
        rawConfigs = await this._hGetAll(key);
      } else if (configs.length === 1) {
        rawConfigs = {
          [configs[0]]: await this._hGet(key, configs[0]),
        };
      } else {
        const vals = await this._client.hmGet(key, configs);
        rawConfigs = Object.fromEntries(configs.map((i, j) => [i, vals[j]]));
      }

      const parsedConfigs = parseConfigs(rawConfigs);
      return parsedConfigs;
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[getConfigs] Error.");
    }
  }

  public async setConfigs(configs: ConfigHash): Promise<void> {
    try {
      let stringified: Record<string, string> = {};
      for (const [k, v] of Object.entries(configs)) {
        stringified[k] = JSON.stringify(v);
      }

      await this._hSet(RedisKeys.configs(), stringified);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[setConfigs] Error.");
    }
  }

  public async getAllCurrentPower(): Promise<[string, PowerData][]> {
    try {
      const memIndex = await this._sGet(RedisKeys.memIndex());
      if (!memIndex) return [];
      const memKeys = memIndex.map((m) => `members:${m}:power:current`);

      const pipeline = this._client.multi();

      for (const k of memKeys) {
        pipeline.hGetAll(k);
      }
      const res = (await pipeline.exec())
        .map((i, j) => [
          memIndex[j],
          parseStoredPower(i as unknown as Record<string, string>),
        ])
        .filter((i) => i[1] !== null) as [string, PowerData][];

      return res;
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[getAllCurrentPower] Error.");
    }
  }

  public async updateAchievementProgress<T extends AchKeys>(
    memberId: string,
    achKey: T,
    achData: AchData<T>,
  ): Promise<void> {
    const key = RedisKeys.achievement(memberId, achKey);
    try {
      await this._hSet(key, achData);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[updateAchievementProgress] Error.");
    }
  }

  public async getAchievementProgress(
    memberId: string,
    achKey: AchKeys,
  ): Promise<AchData<typeof achKey> | null> {
    try {
      const key = RedisKeys.achievement(memberId, achKey);
      const raw = await this._hGetAll(key);
      return parseAchData(achKey, raw);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[getAchievementProgress] Error.");
    }
  }

  public async updateStats(memberId: string, stats: Stats): Promise<void> {
    const key = RedisKeys.stats(memberId);
    try {
      await this._hSet(key, stats);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[updateStats] Error.");
    }
  }

  public async getStats(memberId: string): Promise<Stats> {
    const key = RedisKeys.stats(memberId);
    try {
      const raw = await this._hGetAll(key);
      return parseStats(raw);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[getStats] Error.");
    }
  }
}
