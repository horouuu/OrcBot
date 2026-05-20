export type AchKeys = "dtm";
export type AchievementRewardRecord = { required: number; reward: number };
/*
    required: unique pets opened
    reward: dtm %
*/
export const uniquePetsData = [
  { required: 1, reward: 0.1 },
  { required: 2, reward: 0.15 },
  { required: 3, reward: 0.2 },
  { required: 4, reward: 0.25 },
  { required: 5, reward: 0.3 },
  { required: 6, reward: 0.35 },
  { required: 7, reward: 0.4 },
  { required: 8, reward: 0.45 },
  { required: 9, reward: 0.5 },
  { required: 10, reward: 0.55 },
  { required: 11, reward: 0.6 },
  { required: 12, reward: 0.65 },
  { required: 13, reward: 0.7 },
  { required: 14, reward: 0.75 },
  { required: 15, reward: 0.8 },
  { required: 17, reward: 0.85 },
  { required: 19, reward: 0.9 },
  { required: 21, reward: 0.95 },
  { required: 23, reward: 1 },
  { required: 25, reward: 1.05 },
] as AchievementRewardRecord[];

/*
    required: pet eggs opened
    reward: dtm %
*/
export const eggsOpenedData = [
  { required: 10, reward: 0.1 },
  { required: 20, reward: 0.12 },
  { required: 30, reward: 0.14 },
  { required: 40, reward: 0.16 },
  { required: 50, reward: 0.18 },
  { required: 105, reward: 0.2 },
  { required: 135, reward: 0.22 },
  { required: 165, reward: 0.24 },
  { required: 195, reward: 0.26 },
  { required: 225, reward: 0.28 },
  { required: 380, reward: 0.3 },
  { required: 460, reward: 0.32 },
  { required: 540, reward: 0.34 },
  { required: 620, reward: 0.36 },
  { required: 700, reward: 0.38 },
  { required: 1025, reward: 0.4 },
  { required: 1175, reward: 0.42 },
  { required: 1325, reward: 0.44 },
  { required: 1475, reward: 0.46 },
  { required: 1625, reward: 0.48 },
  { required: 2190, reward: 0.5 },
  { required: 2430, reward: 0.52 },
  { required: 2670, reward: 0.54 },
  { required: 2910, reward: 0.56 },
  { required: 3150, reward: 0.58 },
  { required: 4025, reward: 0.6 },
  { required: 4375, reward: 0.62 },
  { required: 4725, reward: 0.64 },
  { required: 5075, reward: 0.66 },
  { required: 5425, reward: 0.68 },
] as AchievementRewardRecord[];

export function toText(inp: AchievementRewardRecord[]) {
  return inp
    .map((d) => `${d.required}`.padEnd(10) + `${d.reward.toFixed(2)}%`)
    .join("\n");
}

type AchDataMap = {
  dtm: {
    uniquePets: number;
    eggsOpened: number;
  };
};

export type AchData<T extends keyof AchDataMap> = AchDataMap[T];
