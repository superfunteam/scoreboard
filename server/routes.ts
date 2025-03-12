import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTeamSchema, insertSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validation = insertTeamSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid team data", errors: validation.error.format() });
      }
      
      const team = await storage.createTeam(validation.data);
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const validation = insertTeamSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid team data", errors: validation.error.format() });
      }
      
      const team = await storage.updateTeam(id, validation.data);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      await storage.deleteTeam(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // API routes for settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validation = insertSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid settings data", errors: validation.error.format() });
      }
      
      const settings = await storage.updateSettings(validation.data);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Reset all team scores
  app.post("/api/reset-scores", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      const shuffleNames = req.body.shuffleNames === true;
      
      for (const team of teams) {
        await storage.updateTeam(team.id, { 
          score: 0,
          ...(shuffleNames ? { name: undefined } : {})  // This will trigger random name generation in storage
        });
      }
      
      const updatedTeams = await storage.getTeams();
      res.json(updatedTeams);
    } catch (error) {
      res.status(500).json({ message: "Failed to reset scores" });
    }
  });
  
  // Shuffle all team names
  app.post("/api/shuffle-team-names", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      
      for (const team of teams) {
        await storage.updateTeam(team.id, { name: undefined });  // This will trigger random name generation
      }
      
      const updatedTeams = await storage.getTeams();
      res.json(updatedTeams);
    } catch (error) {
      res.status(500).json({ message: "Failed to shuffle team names" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
