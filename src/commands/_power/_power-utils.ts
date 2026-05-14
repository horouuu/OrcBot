export const POWER_UNITS = ["M", "B", "T", "Qa", "Qn"] as const;
export type PowerUnits = (typeof POWER_UNITS)[number];
export function isPowerUnit(x: string): x is PowerUnits {
  return POWER_UNITS.includes(x as PowerUnits);
}

export function isPowerString(x: string): x is PowerString {
  const parts = x.split(" ");

  if (parts.length !== 2) return false;

  const [num, unit] = parts;

  return !Number.isNaN(Number(num)) && isPowerUnit(unit);
}

export type PowerString = `${number} ${PowerUnits}`;
export type PowerHash = {
  value: number;
  units: PowerUnits;
};

export type PowerData = { timestamp: number; power: PowerString };