import { Team, Settings, InsertTeam, InsertSettings, TEAM_COLORS } from "@shared/schema";
import { generateRandomTeamName } from "./nameGenerator";

/**
 * LocalStorage class provides methods to manage application data in browser's localStorage
 */
class LocalStorage {
  teamCurrentId: number;
  private teamsKey = 'scorekeeper:teams';
  private settingsKey = 'scorekeeper:settings';

  constructor() {
    this.teamCurrentId = 1;
    
    // Initialize default data if none exists
    if (this.getItem(this.teamsKey) === null) {
      this.resetStorage();
    } else {
      // Get the highest ID from existing teams to prevent ID conflicts
      const teams = this.getTeams();
      this.teamCurrentId = teams.length > 0 
        ? Math.max(...teams.map(team => team.id)) + 1 
        : 1;
    }
  }

  /**
   * Helper method to get an item from localStorage
   */
  private getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Helper method to set an item in localStorage
   */
  private setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Reset storage to default values
   */
  resetStorage(): void {
    // Create default teams (2 teams)
    const defaultTeams: Team[] = Array.from({ length: 2 }).map((_, index) => ({
      id: index + 1,
      name: generateRandomTeamName(),
      score: 0,
      color: TEAM_COLORS[index % TEAM_COLORS.length]
    }));

    // Create default settings
    const defaultSettings: Settings = {
      id: 1,
      teamCount: 2, // Default to 2 teams
      scoreIncrement: 100
    };

    this.setItem(this.teamsKey, defaultTeams);
    this.setItem(this.settingsKey, defaultSettings);
    this.teamCurrentId = defaultTeams.length + 1;
  }

  /**
   * Get all teams from localStorage
   */
  getTeams(): Team[] {
    const teamsData = this.getItem(this.teamsKey);
    return teamsData ? JSON.parse(teamsData) : [];
  }

  /**
   * Get a single team by ID
   */
  getTeam(id: number): Team | undefined {
    const teams = this.getTeams();
    return teams.find(team => team.id === id);
  }

  /**
   * Create a new team
   */
  createTeam(team: InsertTeam): Team {
    const teams = this.getTeams();
    
    // Ensure required fields have values
    const finalName: string = team.name ?? generateRandomTeamName();
    const finalScore: number = team.score ?? 0;
    const finalColor: string = team.color ?? TEAM_COLORS[0];
    
    const newTeam: Team = { 
      id: this.teamCurrentId++,
      name: finalName,
      score: finalScore,
      color: finalColor
    };
    
    teams.push(newTeam);
    this.setItem(this.teamsKey, teams);
    
    return newTeam;
  }

  /**
   * Update an existing team
   */
  updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Team | undefined {
    const teams = this.getTeams();
    const index = teams.findIndex(team => team.id === id);
    
    if (index === -1) return undefined;
    
    // Update team properties
    teams[index] = {
      ...teams[index],
      ...teamUpdate
    };
    
    this.setItem(this.teamsKey, teams);
    return teams[index];
  }

  /**
   * Delete a team
   */
  deleteTeam(id: number): void {
    const teams = this.getTeams();
    const updatedTeams = teams.filter(team => team.id !== id);
    this.setItem(this.teamsKey, updatedTeams);
  }

  /**
   * Get settings from localStorage
   */
  getSettings(): Settings {
    const settingsData = this.getItem(this.settingsKey);
    
    if (!settingsData) {
      // Create default settings if none exist
      const defaultSettings: Settings = {
        id: 1,
        teamCount: 2, // Default to 2 teams
        scoreIncrement: 100
      };
      this.setItem(this.settingsKey, defaultSettings);
      return defaultSettings;
    }
    
    return JSON.parse(settingsData);
  }

  /**
   * Update settings
   */
  updateSettings(settingsUpdate: InsertSettings): Settings {
    const currentSettings = this.getSettings();
    
    // Update settings
    const updatedSettings: Settings = {
      ...currentSettings,
      ...settingsUpdate
    };
    
    this.setItem(this.settingsKey, updatedSettings);
    
    // If team count changed, add or remove teams as needed
    this.adjustTeamCount(updatedSettings.teamCount);
    
    return updatedSettings;
  }

  /**
   * Reset all scores to zero, optionally shuffling team names
   */
  resetScores(shuffleNames: boolean = false): Team[] {
    const teams = this.getTeams();
    
    const updatedTeams = teams.map(team => ({
      ...team,
      score: 0,
      name: shuffleNames ? generateRandomTeamName() : team.name
    }));
    
    this.setItem(this.teamsKey, updatedTeams);
    return updatedTeams;
  }

  /**
   * Shuffle all team names
   */
  shuffleTeamNames(): Team[] {
    const teams = this.getTeams();
    
    const updatedTeams = teams.map(team => ({
      ...team,
      name: generateRandomTeamName()
    }));
    
    this.setItem(this.teamsKey, updatedTeams);
    return updatedTeams;
  }

  /**
   * Adjust the number of teams based on settings
   */
  private adjustTeamCount(targetCount: number): void {
    let teams = this.getTeams();
    const currentCount = teams.length;
    
    if (targetCount === currentCount) return;
    
    if (targetCount > currentCount) {
      // Add more teams
      const colorsInUse = new Set(teams.map(team => team.color));
      const availableColors = TEAM_COLORS.filter(color => !colorsInUse.has(color));
      
      for (let i = currentCount; i < targetCount; i++) {
        const colorIndex = (i - currentCount) % availableColors.length;
        const color = availableColors[colorIndex] || TEAM_COLORS[i % TEAM_COLORS.length];
        
        teams.push({
          id: this.teamCurrentId++,
          name: generateRandomTeamName(),
          score: 0,
          color
        });
      }
    } else {
      // Remove excess teams
      teams = teams.slice(0, targetCount);
    }
    
    this.setItem(this.teamsKey, teams);
  }
}

export const storage = new LocalStorage();