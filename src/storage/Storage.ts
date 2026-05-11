export type RsCdStores = "clues";

export abstract class Storage {
  abstract getPetHolder(holder: string): Promise<string | null>;
  abstract setPetHolder(pet: string, holder: string): Promise<void>;

  handleGenericDbError(e: Error) {
    console.error(e);
  }
}
