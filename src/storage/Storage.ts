import { ConfigHash, ConfigKeys } from "../commands/_config/_config-utils.js";
import { PetHash, PetType } from "../commands/_pet/_pet-utils.js";
import { PowerData, PowerHash } from "../commands/_power/_power-utils.js";

export abstract class Storage {
  abstract addPet(type: PetType, owner: string): Promise<void>;
  abstract delPet(
    petId: number,
  ): Promise<{ success: true; pet: PetHash } | { success: false; pet: null }>;
  abstract listPets(type: PetType | "all"): Promise<PetHash[]>;
  abstract claimPet(
    petId: number,
    userId: string,
  ): Promise<
    { success: false; pet: PetHash | null } | { success: true; pet: PetHash }
  >;

  abstract updatePower(
    memberId: string,
    timestamp: number,
    power: PowerHash,
  ): Promise<void>;

  handleGenericDbError(e: Error) {
    console.error(e);
  }

  abstract getCurrPower(memberId: string): Promise<PowerData | null>;
  abstract getPowerHistory(
    memberId: string,
    size: number,
  ): Promise<PowerData[] | null>;

  abstract getConfigs(configs?: ConfigKeys[]): Promise<Partial<ConfigHash>>;
  abstract setConfigs(configs: ConfigHash): Promise<void>;
}
