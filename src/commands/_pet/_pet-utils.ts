import { ColorResolvable } from "discord.js";

export enum petCommands {
  PET_CHECK = "check",
  PET_SET = "set",
  PET_ADD = "add",
  PET_DEL = "del",
}

export type PetType = "furnace" | "summon" | "altar";
export type PetHash = {
  id: number;
  type: PetType;
  owner: string;
  holder: string;
};
export const petColors: Record<PetType, ColorResolvable> = {
  furnace: "DarkRed",
  summon: "Aqua",
  altar: "DarkGold",
};

export function parsePetHash(hash: Record<string, string>): PetHash | null {
  if (!hash.id || !hash.type || !hash.owner || hash.holder === undefined) {
    return null;
  }

  return {
    id: Number(hash.id),
    type: hash.type as PetType,
    owner: hash.owner,
    holder: hash.holder,
  };
}
