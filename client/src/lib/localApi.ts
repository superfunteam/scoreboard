import { InsertTeam, InsertSettings, Team, Settings } from "@shared/schema";
import { storage } from "./localStorage";

// Add some delay to simulate network latency for a more realistic API experience
async function simulateApiCall<T>(callback: () => T): Promise<T> {
  // Short delay between 100-300ms to simulate network
  const delay = Math.floor(Math.random() * 200) + 100;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    }, delay);
  });
}

// API interface that mimics server API but uses localStorage
export const localApi = {
  // Team operations
  getTeams: async (): Promise<Team[]> => {
    return simulateApiCall(() => storage.getTeams());
  },
  
  getTeam: async (id: number): Promise<Team | undefined> => {
    return simulateApiCall(() => storage.getTeam(id));
  },
  
  createTeam: async (team: InsertTeam): Promise<Team> => {
    return simulateApiCall(() => storage.createTeam(team));
  },
  
  updateTeam: async (id: number, team: Partial<InsertTeam>): Promise<Team | undefined> => {
    return simulateApiCall(() => storage.updateTeam(id, team));
  },
  
  deleteTeam: async (id: number): Promise<void> => {
    return simulateApiCall(() => storage.deleteTeam(id));
  },
  
  // Settings operations
  getSettings: async (): Promise<Settings> => {
    return simulateApiCall(() => storage.getSettings());
  },
  
  updateSettings: async (settings: InsertSettings): Promise<Settings> => {
    return simulateApiCall(() => storage.updateSettings(settings));
  },
  
  // Additional operations
  resetScores: async ({ shuffleNames = false }: { shuffleNames: boolean }): Promise<Team[]> => {
    return simulateApiCall(() => storage.resetScores(shuffleNames));
  },
  
  shuffleTeamNames: async (): Promise<Team[]> => {
    return simulateApiCall(() => storage.shuffleTeamNames());
  }
};