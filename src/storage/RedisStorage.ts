import { ConfigType } from "../utils/config.js";
import { Storage } from "./Storage.js";
import { createClient } from "redis";
import { parsePetHash, PetHash, PetType } from "../commands/_pet/_pet-utils.js";

enum RedisTypes {
  STRING = "string",
  SET = "set",
  HASH = "hash",
  NONE = "none",
}

const RedisKeys = {
  pets: (id: number) => `pets:${id}`,
  petSet: (type: PetType) => `pets:type:${type}`,
  petId: () => `pets:id`,
};

function createNewPet(id: number, type: PetType, owner: string): PetHash {
  return {
    id,
    type,
    owner,
    holder: "",
  };
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

  public async getPetHolder(key: PetType): Promise<string | null> {
    return await this._get(key);
  }

  public async setPetHolder(pet: PetType, holder: string): Promise<void> {
    await this._set(pet, holder);
  }

  public async addPet(type: PetType, owner: string) {
    try {
      const id = await this._client.incr(RedisKeys.petId());
      const newPet = createNewPet(id, type, owner);

      await this._hSet(RedisKeys.pets(id), newPet);
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[addPet] Failed to write to database.");
    }
  }

  public async delPet<T>(
    id: number,
  ): Promise<{ success: true; pet: PetHash } | { success: false; pet: null }> {
    try {
      const key = RedisKeys.pets(id);
      const petData = await this._hGetAll(id.toString());
      const pet = parsePetHash(petData);

      if (pet) {
        await this._del(key);
        return { success: true, pet };
      } else {
        return { success: false, pet: null };
      }
    } catch (e) {
      this.handleGenericDbError(e as Error);
      throw new Error("[delPet] Failed to delete pet from database.");
    }
  }
}
