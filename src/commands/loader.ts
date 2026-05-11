import * as fs from "fs";
import * as path from "node:path";
import { pathToFileURL } from "url";
import { Command } from "../bot.types.js";

const extension: string = process.env.NODE_ENV !== "production" ? ".ts" : ".js";

export async function loadCommands(): Promise<Record<string, Command>> {
  const currentPath = import.meta.dirname;
  const files = fs
    .readdirSync(currentPath, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile())
    .filter((f) => !/[A-Z_]/.test(f.name.charAt(0)))
    .filter((f) => f.name !== `loader${extension}`)
    .filter((f) => f.name.endsWith(extension));

  const commands = await Promise.all(
    files.map(async (f) => {
      const mod = await import(
        pathToFileURL(path.join(currentPath, f.name)).href
      );
      const cmdLabel = path.basename(f.name, path.extname(f.name));
      const cmd = mod[cmdLabel];

      if (!cmd) {
        throw new Error(
          `File ${f.name} does not contain export "${cmdLabel}".`,
        );
      }

      return [cmdLabel, cmd];
    }),
  );

  return Object.fromEntries(commands);
}
