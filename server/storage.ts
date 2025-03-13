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
    const previousTeamCount = this.settings.teamCount;
    this.settings = { ...this.settings, ...settingsUpdate };
    
    // If team count changed, adjust team count
    if (settingsUpdate.teamCount !== undefined && settingsUpdate.teamCount !== previousTeamCount) {
      await this.adjustTeamCount(settingsUpdate.teamCount);
    }
    
    return this.settings;
  }
  
  // Adjust the number of teams based on settings
  // Only adds or removes the exact number of teams needed
  private async adjustTeamCount(targetCount: number): Promise<void> {
    // Get all current teams
    let allTeams = await this.getTeams();
    console.log(`Current team count: ${allTeams.length}, Target count: ${targetCount}`);
    
    // If we already have the right number of teams, do nothing
    if (targetCount === allTeams.length) {
      console.log("Team count already matches target, no adjustment needed");
      return;
    }
    
    // If we need to add teams
    if (targetCount > allTeams.length) {
      // Calculate exactly how many teams to add
      const teamsToAdd = targetCount - allTeams.length;
      console.log(`Adding ${teamsToAdd} teams to reach target of ${targetCount}`);
      
      // Get currently used colors to avoid duplicates
      const colorsInUse = new Set(allTeams.map(team => team.color));
      
      // Get colors that aren't being used yet (make a copy to avoid modifying the original)
      const availableColors = [...TEAM_COLORS].filter(color => !colorsInUse.has(color));
      
      // Add the exact number of teams needed
      for (let i = 0; i < teamsToAdd; i++) {
        // Choose color from available colors, or fallback to rotating through all colors
        let color;
        if (availableColors.length > 0) {
          // Take a color from available colors
          color = availableColors.shift() || TEAM_COLORS[i % TEAM_COLORS.length];
        } else {
          // All colors are used, just cycle through them
          color = TEAM_COLORS[i % TEAM_COLORS.length];
        }
        
        // Create the new team
        await this.createTeam({
          name: generateRandomTeamName(),
          score: 0,
          color
        });
      }
      
      // Verify the team count after adding
      allTeams = await this.getTeams();
      console.log(`After adding, team count is now: ${allTeams.length}`);
      
      // If somehow we still don't have exactly the right number, throw an error
      if (allTeams.length !== targetCount) {
        console.error(`ERROR: Failed to add teams correctly. Wanted ${targetCount} but have ${allTeams.length}`);
      }
    } 
    // If we need to remove teams
    else if (targetCount < allTeams.length) {
      // Calculate exactly how many teams to remove
      const teamsToRemove = allTeams.length - targetCount;
      console.log(`Removing ${teamsToRemove} teams to reach target of ${targetCount}`);
      
      // Sort teams by ID (descending) and take the ones to remove
      // This ensures we remove the newest teams first
      const sortedTeams = [...allTeams].sort((a, b) => b.id - a.id);
      const teamsToDelete = sortedTeams.slice(0, teamsToRemove);
      
      // Delete each team
      for (const team of teamsToDelete) {
        await this.deleteTeam(team.id);
      }
      
      // Verify the team count after removing
      allTeams = await this.getTeams();
      console.log(`After removing, team count is now: ${allTeams.length}`);
      
      // If somehow we still don't have exactly the right number, throw an error
      if (allTeams.length !== targetCount) {
        console.error(`ERROR: Failed to remove teams correctly. Wanted ${targetCount} but have ${allTeams.length}`);
      }
    }
  }
}

export const storage = new MemStorage();
