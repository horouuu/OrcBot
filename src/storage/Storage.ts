export type RsCdStores = "clues";

type storeKeys = "petHolder";

export abstract class Storage {
  abstract getPetHolder(): Promise<string | null>;
  abstract setPetHolder(holder: string): Promise<void>;

  handleGenericDbError(e: Error) {
    console.error(e);
  }
}
