import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: varchar("firebase_uid", { length: 128 }).unique().notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  businessName: text("business_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionCategories = pgTable("transaction_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'income' or 'expense'
  color: varchar("color", { length: 7 }).default("#059669"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").references(() => customers.id),
  categoryId: integer("category_id").references(() => transactionCategories.id),
  type: varchar("type", { length: 10 }).notNull(), // 'income' or 'expense'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hppCalculations = pgTable("hpp_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  rawMaterialCost: decimal("raw_material_cost", { precision: 15, scale: 2 }).notNull(),
  laborCost: decimal("labor_cost", { precision: 15, scale: 2 }).notNull(),
  overheadCost: decimal("overhead_cost", { precision: 15, scale: 2 }).notNull(),
  totalUnits: integer("total_units").notNull(),
  totalHPP: decimal("total_hpp", { precision: 15, scale: 2 }).notNull(),
  hppPerUnit: decimal("hpp_per_unit", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessSettings = pgTable("business_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fixedCosts: decimal("fixed_costs", { precision: 15, scale: 2 }).default("0"),
  targetProfit: decimal("target_profit", { precision: 15, scale: 2 }).default("0"),
  averageSellingPrice: decimal("average_selling_price", { precision: 15, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  customers: many(customers),
  transactions: many(transactions),
  categories: many(transactionCategories),
  hppCalculations: many(hppCalculations),
  businessSettings: one(businessSettings),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionCategoriesRelations = relations(transactionCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [transactionCategories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  category: one(transactionCategories, {
    fields: [transactions.categoryId],
    references: [transactionCategories.id],
  }),
}));

export const hppCalculationsRelations = relations(hppCalculations, ({ one }) => ({
  user: one(users, {
    fields: [hppCalculations.userId],
    references: [users.id],
  }),
}));

export const businessSettingsRelations = relations(businessSettings, ({ one }) => ({
  user: one(users, {
    fields: [businessSettings.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionCategorySchema = createInsertSchema(transactionCategories).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertHppCalculationSchema = createInsertSchema(hppCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSettingsSchema = createInsertSchema(businessSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type TransactionCategory = typeof transactionCategories.$inferSelect;
export type InsertTransactionCategory = z.infer<typeof insertTransactionCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type HppCalculation = typeof hppCalculations.$inferSelect;
export type InsertHppCalculation = z.infer<typeof insertHppCalculationSchema>;

export type BusinessSettings = typeof businessSettings.$inferSelect;
export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;
