export function getLevelInfo(xp: number, difficultyFactor: number) {
  let level = 0;
  let xpRequired = 0;
  let nextXpRequired = 0;

  while (xp >= xpRequired + (level + 1) * difficultyFactor) {
      level++;
      xpRequired += level * difficultyFactor;
  }

  nextXpRequired = xpRequired + (level + 1) * difficultyFactor;

  return {
      level,
      xp,
      xpRequiredForNext: nextXpRequired - xp,
      totalXpRequired: nextXpRequired
  };
}