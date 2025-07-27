import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChoreSchema, insertGoalSchema, allocateToGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // For this demo, we'll create a default user if none exists
  const ensureDefaultUser = async () => {
    let user = await storage.getUserByUsername("kid");
    if (!user) {
      user = await storage.createUser({
        username: "kid",
        password: "password123"
      });
    }
    return user;
  };

  // Get user data
  app.get("/api/user", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Get chores
  app.get("/api/chores", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const chores = await storage.getChores(user.id);
      res.json(chores);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chores" });
    }
  });

  // Create chore
  app.post("/api/chores", async (req, res) => {
    try {
      const choreData = insertChoreSchema.parse(req.body);
      const user = await ensureDefaultUser();
      const chore = await storage.createChore(user.id, choreData);
      res.json(chore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid chore data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create chore" });
      }
    }
  });

  // Update chore
  app.patch("/api/chores/:id", async (req, res) => {
    try {
      const choreId = parseInt(req.params.id);
      const updates = insertChoreSchema.partial().parse(req.body);
      const chore = await storage.updateChore(choreId, updates);
      res.json(chore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid chore data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update chore" });
      }
    }
  });

  // Delete chore
  app.delete("/api/chores/:id", async (req, res) => {
    try {
      const choreId = parseInt(req.params.id);
      await storage.deleteChore(choreId);
      res.json({ message: "Chore deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chore" });
    }
  });

  // Claim chore
  app.post("/api/chores/:id/claim", async (req, res) => {
    try {
      const choreId = parseInt(req.params.id);
      const user = await ensureDefaultUser();
      const result = await storage.claimChore(user.id, choreId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to claim chore" });
    }
  });

  // Get goals
  app.get("/api/goals", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const goals = await storage.getGoals(user.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  // Create goal
  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const user = await ensureDefaultUser();
      const goal = await storage.createGoal(user.id, goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  // Update goal
  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const updates = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(goalId, updates);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  // Delete goal
  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      await storage.deleteGoal(goalId);
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Allocate money to goal
  app.post("/api/goals/allocate", async (req, res) => {
    try {
      const allocationData = allocateToGoalSchema.parse(req.body);
      const user = await ensureDefaultUser();
      const result = await storage.allocateToGoal(user.id, allocationData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid allocation data", errors: error.errors });
      } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "Failed to allocate money" });
      }
    }
  });

  // Get transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      const transactions = await storage.getTransactions(user.id, 10);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  // Undo transaction
  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const user = await ensureDefaultUser();
      await storage.undoTransaction(user.id, transactionId);
      res.json({ message: "Transaction undone successfully" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to undo transaction" });
    }
  });

  // Complete reset
  app.post("/api/reset", async (req, res) => {
    try {
      const user = await ensureDefaultUser();
      await storage.completeReset(user.id);
      res.json({ message: "Complete reset successful" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
