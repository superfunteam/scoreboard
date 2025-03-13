/**
 * Collection of adjectives and colors for team name generation
 */
export const firstCollection = [
  "Mighty", "Fierce", "Swift", "Bright", "Brave", 
  "Clever", "Bold", "Daring", "Grand", "Royal",
  "Rapid", "Golden", "Silver", "Crimson", "Emerald",
  "Noble", "Mystic", "Glorious", "Radiant", "Epic",
  "Electric", "Cosmic", "Flaming", "Dynamic", "Raging",
  "Stellar", "Iron", "Bronze", "Shadow", "Stealth",
  "Quantum", "Atomic", "Blazing", "Frozen", "Thunder",
  "Lightning", "Sapphire", "Diamond", "Crystal", "Obsidian"
];

/**
 * Collection of animals, objects, and roles in plural form for team name generation
 * All items are already pluralized to avoid issues with pluralization logic
 */
export const secondCollection = [
  "Falcons", "Tigers", "Wolves", "Eagles", "Bears", 
  "Lions", "Dragons", "Sharks", "Phoenixes", "Hawks",
  "Panthers", "Jaguars", "Cobras", "Vipers", "Rhinos",
  "Knights", "Ninjas", "Warriors", "Wizards", "Titans",
  "Pirates", "Vikings", "Hunters", "Rangers", "Champions",
  "Gladiators", "Samurais", "Spartans", "Archers", "Guardians",
  "Cyclones", "Storms", "Tempests", "Hurricanes", "Tornados",
  "Comets", "Meteors", "Stars", "Planets", "Galaxies",
  "Rockets", "Blazers", "Flames", "Thunders", "Bolts"
];

/**
 * Generates a random team name by combining one item from the first collection 
 * and one item from the second collection (which are already in plural form)
 */
export function generateRandomTeamName(): string {
  const firstWord = firstCollection[Math.floor(Math.random() * firstCollection.length)];
  const secondWord = secondCollection[Math.floor(Math.random() * secondCollection.length)];
  
  return `${firstWord} ${secondWord}`;
}