import {
  AchData,
  AchKeys,
} from "../commands/_achievements/_achievements-utils.js";
import { ConfigHash, ConfigKeys } from "../commands/_config/_config-utils.js";
import { PetHash, PetType } from "../commands/_pet/_pet-utils.js";
import { PowerData, PowerHash } from "../commands/_power/_power-utils.js";
import { Stats } from "../commands/_stats/_stats-utils.js";

export default abstract class Storage {
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
  abstract getAllCurrentPower(): Promise<[string, PowerData][]>;
  abstract updateAchievementProgress<T extends AchKeys>(
    memberId: string,
    achKey: T,
    achData: AchData<T>,
  ): Promise<void>;

  abstract getAchievementProgress(
    memberId: string,
    achKey: AchKeys,
  ): Promise<AchData<typeof achKey> | null>;

  abstract updateStats(memberId: string, stats: Stats): Promise<void>;
  abstract getStats(memberId: string): Promise<Stats>;
}
