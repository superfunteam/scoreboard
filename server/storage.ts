import { teams, settings, TEAM_COLORS, type Team, type InsertTeam, type Settings, type InsertSettings } from "@shared/schema";
import { generateRandomTeamName } from "../client/src/lib/nameGenerator";

export interface IStorage {
  // Team operations
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<void>;

  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private teams: Map<number, Team>;
  private settings: Settings;
  teamCurrentId: number;
  
  constructor() {
    this.teams = new Map();
    this.teamCurrentId = 3; // Start at 3 after initializing 2 teams
    
    // Initialize with default 2 teams with random names and different colors
    this.teams.set(1, { 
      id: 1, 
      name: generateRandomTeamName(), 
      score: 0,
      color: TEAM_COLORS[0]
    });
    
    this.teams.set(2, { 
      id: 2, 
      name: generateRandomTeamName(), 
      score: 0,
      color: TEAM_COLORS[1]
    });
    
    // Initialize default settings
    this.settings = {
      id: 1,
      teamCount: 2,
      scoreIncrement: 100
    };
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.teamCurrentId++;
    
    // Ensure we have a color - if not provided, assign a color based on team number (rotating through our colors)
    const color = team.color || TEAM_COLORS[(id - 1) % TEAM_COLORS.length];
    
    // Make sure score is a number
    const score = typeof team.score === 'number' ? team.score : 0;
    
    // Use a random team name if none is provided
    const name = team.name || generateRandomTeamName();
    
    const newTeam: Team = { 
      id, 
      name,
      score,
      color 
    };
    
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    
    // If name is explicitly set to undefined, generate a new random name
    if (teamUpdate.hasOwnProperty('name') && teamUpdate.name === undefined) {
      teamUpdate.name = generateRandomTeamName();
    }
    
    const updatedTeam = { ...team, ...teamUpdate };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<void> {
    this.teams.delete(id);
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(settingsUpdate: InsertSettings): Promise<Settings> {
    this.settings = { ...this.settings, ...settingsUpdate };
    return this.settings;
  }
}

export const storage = new MemStorage();
