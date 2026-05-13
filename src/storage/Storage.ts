import { PetHash, PetType } from "../commands/_pet/_pet-utils.js";

export abstract class Storage {
  abstract getPetHolder(holder: string): Promise<string | null>;
  abstract setPetHolder(pet: string, holder: string): Promise<void>;

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

  handleGenericDbError(e: Error) {
    console.error(e);
  }
}
