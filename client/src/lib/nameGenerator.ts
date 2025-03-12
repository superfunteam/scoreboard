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
 * Collection of animals, objects, and roles for team name generation
 */
export const secondCollection = [
  "Falcon", "Tiger", "Wolf", "Eagle", "Bear", 
  "Lion", "Dragon", "Shark", "Phoenix", "Hawk",
  "Panther", "Jaguar", "Cobra", "Viper", "Rhino",
  "Knight", "Ninja", "Warrior", "Wizard", "Titan",
  "Pirate", "Viking", "Hunter", "Ranger", "Champion",
  "Gladiator", "Samurai", "Spartan", "Archer", "Guardian",
  "Cyclone", "Storm", "Tempest", "Hurricane", "Tornado",
  "Comet", "Meteor", "Star", "Planet", "Galaxy"
];

/**
 * Makes a word plural using common English rules
 */
function makePlural(word: string): string {
  // Words ending in "y" preceded by a consonant
  if (word.endsWith('y') && !/[aeiou]/i.test(word.charAt(word.length - 2))) {
    return word.slice(0, -1) + 'ies';
  }
  
  // Words ending in s, x, z, ch, sh
  if (/s$|x$|z$|ch$|sh$/i.test(word)) {
    return word + 'es';
  }
  
  // Words ending in o preceded by a consonant
  if (word.endsWith('o') && !/[aeiou]/i.test(word.charAt(word.length - 2))) {
    return word + 'es';
  }
  
  // Special cases
  const specialCases: Record<string, string> = {
    'Person': 'People',
    'Man': 'Men',
    'Woman': 'Women',
    'Child': 'Children',
    'Tooth': 'Teeth',
    'Foot': 'Feet',
    'Goose': 'Geese',
    'Mouse': 'Mice',
    'Ox': 'Oxen',
    'Deer': 'Deer',
    'Sheep': 'Sheep',
    'Fish': 'Fish',
    'Moose': 'Moose'
  };
  
  if (specialCases[word]) {
    return specialCases[word];
  }
  
  // Default: add "s"
  return word + 's';
}

/**
 * Generates a random team name by combining one item from the first collection 
 * and one item from the second collection, making the second word plural
 */
export function generateRandomTeamName(): string {
  const firstWord = firstCollection[Math.floor(Math.random() * firstCollection.length)];
  const secondWord = secondCollection[Math.floor(Math.random() * secondCollection.length)];
  const pluralSecondWord = makePlural(secondWord);
  
  return `${firstWord} ${pluralSecondWord}`;
}