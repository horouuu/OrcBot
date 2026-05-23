export type Stats = {
  egr: number;
  gdr: number;
  eed: number;
  egd: number;
  odr: number;
};

export function parseStats(d: Object) {
  if (
    !("egr" in d) ||
    !("gdr" in d) ||
    !("eed" in d) ||
    !("egd" in d) ||
    !("odr" in d)
  ) {
    return {
      egr: 0,
      gdr: 0,
      eed: 0,
      egd: 0,
      odr: 0,
    } as Stats;
  }

  return d as Stats;
}
