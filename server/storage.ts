import { 
  users, 
  chores, 
  goals, 
  transactions,
  type User, 
  type InsertUser,
  type Chore,
  type InsertChore,
  type Goal,
  type InsertGoal,
  type Transaction,
  type InsertTransaction,
  type AllocateToGoal
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: string): Promise<void>;
  
  getChores(userId: number): Promise<Chore[]>;
  createChore(userId: number, chore: InsertChore): Promise<Chore>;
  updateChore(choreId: number, updates: Partial<InsertChore>): Promise<Chore>;
  deleteChore(choreId: number): Promise<void>;
  
  getGoals(userId: number): Promise<Goal[]>;
  createGoal(userId: number, goal: InsertGoal): Promise<Goal>;
  updateGoal(goalId: number, updates: Partial<Goal>): Promise<Goal>;
  deleteGoal(goalId: number): Promise<void>;
  
  getTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction>;
  
  claimChore(userId: number, choreId: number): Promise<{ transaction: Transaction; newBalance: string }>;
  allocateToGoal(userId: number, allocation: AllocateToGoal): Promise<{ transaction: Transaction; newBalance: string; updatedGoal: Goal }>;
  undoTransaction(userId: number, transactionId: number): Promise<void>;
  completeReset(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(userId: number, newBalance: string): Promise<void> {
    await db
      .update(users)
      .set({ totalBalance: newBalance })
      .where(eq(users.id, userId));
  }

  async getChores(userId: number): Promise<Chore[]> {
    return await db
      .select()
      .from(chores)
      .where(and(eq(chores.userId, userId), eq(chores.isActive, true)))
      .orderBy(desc(chores.createdAt));
  }

  async createChore(userId: number, chore: InsertChore): Promise<Chore> {
    const [newChore] = await db
      .insert(chores)
      .values({ ...chore, userId })
      .returning();
    return newChore;
  }

  async updateChore(choreId: number, updates: Partial<InsertChore>): Promise<Chore> {
    const [updatedChore] = await db
      .update(chores)
      .set(updates)
      .where(eq(chores.id, choreId))
      .returning();
    return updatedChore;
  }

  async deleteChore(choreId: number): Promise<void> {
    await db
      .update(chores)
      .set({ isActive: false })
      .where(eq(chores.id, choreId));
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.isCompleted, false)))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(userId: number, goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values({ ...goal, userId })
      .returning();
    return newGoal;
  }

  async updateGoal(goalId: number, updates: Partial<Goal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, goalId))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(goalId: number): Promise<void> {
    await db
      .delete(goals)
      .where(eq(goals.id, goalId));
  }

  async getTransactions(userId: number, limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({ ...transaction, userId })
      .returning();
    return newTransaction;
  }

  async claimChore(userId: number, choreId: number): Promise<{ transaction: Transaction; newBalance: string }> {
    const [chore] = await db.select().from(chores).where(eq(chores.id, choreId));
    if (!chore) {
      throw new Error("Chore not found");
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = (parseFloat(user.totalBalance) + parseFloat(chore.amount)).toFixed(2);
    
    await this.updateUserBalance(userId, newBalance);
    
    const transaction = await this.createTransaction(userId, {
      type: "chore_completed",
      amount: chore.amount,
      description: `Completed: ${chore.name}`,
      choreId: choreId,
      goalId: null,
    });

    return { transaction, newBalance };
  }

  async allocateToGoal(userId: number, allocation: AllocateToGoal): Promise<{ transaction: Transaction; newBalance: string; updatedGoal: Goal }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    const [goal] = await db.select().from(goals).where(eq(goals.id, allocation.goalId));
    if (!goal) {
      throw new Error("Goal not found");
    }

    const amount = parseFloat(allocation.amount);
    const currentBalance = parseFloat(user.totalBalance);
    
    if (amount > currentBalance) {
      throw new Error("Insufficient balance");
    }

    const newBalance = (currentBalance - amount).toFixed(2);
    const newGoalAmount = (parseFloat(goal.currentAmount) + amount).toFixed(2);
    
    await this.updateUserBalance(userId, newBalance);
    
    const updatedGoal = await this.updateGoal(allocation.goalId, {
      currentAmount: newGoalAmount,
      isCompleted: parseFloat(newGoalAmount) >= parseFloat(goal.targetAmount)
    });

    const transaction = await this.createTransaction(userId, {
      type: "goal_allocation",
      amount: `-${amount.toFixed(2)}`,
      description: `Allocated to: ${goal.name}`,
      choreId: null,
      goalId: allocation.goalId,
    });

    return { transaction, newBalance, updatedGoal };
  }

  async undoTransaction(userId: number, transactionId: number): Promise<void> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId));
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found or unauthorized");
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Check if transaction is recent (within 24 hours)
    const transactionTime = new Date(transaction.createdAt).getTime();
    const now = Date.now();
    if (now - transactionTime > 24 * 60 * 60 * 1000) {
      throw new Error("Cannot undo transactions older than 24 hours");
    }

    // Reverse the transaction
    if (transaction.type === "chore_completed") {
      // Subtract the amount from user balance
      const amount = parseFloat(transaction.amount);
      const newBalance = (parseFloat(user.totalBalance) - amount).toFixed(2);
      await this.updateUserBalance(userId, newBalance);
    } else if (transaction.type === "goal_allocation") {
      // Add back to user balance and subtract from goal
      const amount = Math.abs(parseFloat(transaction.amount));
      const newBalance = (parseFloat(user.totalBalance) + amount).toFixed(2);
      await this.updateUserBalance(userId, newBalance);

      if (transaction.goalId) {
        const [goal] = await db.select().from(goals).where(eq(goals.id, transaction.goalId));
        if (goal) {
          const newGoalAmount = Math.max(0, parseFloat(goal.currentAmount) - amount).toFixed(2);
          await this.updateGoal(transaction.goalId, {
            currentAmount: newGoalAmount,
            isCompleted: parseFloat(newGoalAmount) >= parseFloat(goal.targetAmount)
          });
        }
      }
    }

    // Delete the transaction
    await db.delete(transactions).where(eq(transactions.id, transactionId));
  }

  async completeReset(userId: number): Promise<void> {
    // Delete all user data
    await db.delete(transactions).where(eq(transactions.userId, userId));
    await db.delete(chores).where(eq(chores.userId, userId));
    await db.delete(goals).where(eq(goals.userId, userId));
    
    // Reset user balance
    await this.updateUserBalance(userId, "0.00");
  }
}

export const storage = new DatabaseStorage();
