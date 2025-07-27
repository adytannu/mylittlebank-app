import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  totalBalance: decimal("total_balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chores = pgTable("chores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").default("broom"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'chore_completed', 'goal_allocation'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  choreId: integer("chore_id").references(() => chores.id),
  goalId: integer("goal_id").references(() => goals.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  chores: many(chores),
  goals: many(goals),
  transactions: many(transactions),
}));

export const choresRelations = relations(chores, ({ one, many }) => ({
  user: one(users, { fields: [chores.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  chore: one(chores, { fields: [transactions.choreId], references: [chores.id] }),
  goal: one(goals, { fields: [transactions.goalId], references: [goals.id] }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChoreSchema = createInsertSchema(chores).pick({
  name: true,
  description: true,
  amount: true,
  icon: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  description: true,
  targetAmount: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  amount: true,
  description: true,
  choreId: true,
  goalId: true,
});

export const allocateToGoalSchema = z.object({
  goalId: z.number(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChore = z.infer<typeof insertChoreSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type AllocateToGoal = z.infer<typeof allocateToGoalSchema>;

export type User = typeof users.$inferSelect;
export type Chore = typeof chores.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
