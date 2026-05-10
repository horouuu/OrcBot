import dotenv from "dotenv";
import { z } from "zod";
import { SnakeToCamel, snakeToCamel } from "./funcs";

let variableStoreName = "environment variables";
if (process.env.NODE_ENV !== "production") {
  variableStoreName = ".env";
  dotenv.config({ path: "../.env" });
}

const EnvSchema = z.object({
  TOKEN: z.string().min(1, `Missing TOKEN value in ${variableStoreName}`),
  APP_ID: z.string().min(1, `Missing APP_ID value in ${variableStoreName}`),
  REDIS_URL: z.string().min(1, `Missing REDIS_URL in ${variableStoreName}`),
});

type Env = z.infer<typeof EnvSchema>;
type EnvAccessors = {
  [K in keyof Env as SnakeToCamel<K & string>]: Env[K];
};
const configVars = ["TOKEN", "APP_ID", "REDIS_URL"] as const;

export class Config {
  private _env: Env;

  constructor() {
    try {
      const parsed = EnvSchema.parse(process.env);
      this._env = parsed;
    } catch (e) {
      console.error(e);
      throw new Error("Parsing process.env with EnvSchema failed.");
    }

    for (const k of configVars) {
      Object.defineProperty(this, snakeToCamel(k), {
        get: () => this._env[k],
        enumerable: true,
        configurable: false,
      });
    }
  }
}

export interface Config extends EnvAccessors {}
export type ConfigType = EnvAccessors;
