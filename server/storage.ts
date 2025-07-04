import { 
  users, customers, transactions, transactionCategories, hppCalculations, businessSettings,
  type User, type InsertUser, type Customer, type InsertCustomer, 
  type Transaction, type InsertTransaction, type TransactionCategory, type InsertTransactionCategory,
  type HppCalculation, type InsertHppCalculation, type BusinessSettings, type InsertBusinessSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sum, count, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customers
  getCustomers(userId: number): Promise<Customer[]>;
  getCustomer(id: number, userId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>, userId: number): Promise<Customer | undefined>;
  deleteCustomer(id: number, userId: number): Promise<boolean>;
  
  // Transaction Categories
  getTransactionCategories(userId: number): Promise<TransactionCategory[]>;
  createTransactionCategory(category: InsertTransactionCategory): Promise<TransactionCategory>;
  
  // Transactions
  getTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  getTransaction(id: number, userId: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: number): Promise<Transaction | undefined>;
  deleteTransaction(id: number, userId: number): Promise<boolean>;
  getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]>;
  
  // HPP Calculations
  getHppCalculations(userId: number): Promise<HppCalculation[]>;
  createHppCalculation(calculation: InsertHppCalculation): Promise<HppCalculation>;
  
  // Business Settings
  getBusinessSettings(userId: number): Promise<BusinessSettings | undefined>;
  upsertBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings>;
  
  // Analytics
  getFinancialSummary(userId: number, startDate: Date, endDate: Date): Promise<{
    totalIncome: string;
    totalExpense: string;
    netProfit: string;
    transactionCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomers(userId: number): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number, userId: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>, userId: number): Promise<Customer | undefined> {
    const [updated] = await db.update(customers)
      .set(customer)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteCustomer(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)));
    return result.rowCount > 0;
  }

  async getTransactionCategories(userId: number): Promise<TransactionCategory[]> {
    return await db.select().from(transactionCategories).where(eq(transactionCategories.userId, userId));
  }

  async createTransactionCategory(category: InsertTransactionCategory): Promise<TransactionCategory> {
    const [newCategory] = await db.insert(transactionCategories).values(category).returning();
    return newCategory;
  }

  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    let query = db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }

  async getTransaction(id: number, userId: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: number): Promise<Transaction | undefined> {
    const [updated] = await db.update(transactions)
      .set(transaction)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteTransaction(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return result.rowCount > 0;
  }

  async getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      ))
      .orderBy(desc(transactions.date));
  }

  async getHppCalculations(userId: number): Promise<HppCalculation[]> {
    return await db.select().from(hppCalculations).where(eq(hppCalculations.userId, userId)).orderBy(desc(hppCalculations.createdAt));
  }

  async createHppCalculation(calculation: InsertHppCalculation): Promise<HppCalculation> {
    const [newCalculation] = await db.insert(hppCalculations).values(calculation).returning();
    return newCalculation;
  }

  async getBusinessSettings(userId: number): Promise<BusinessSettings | undefined> {
    const [settings] = await db.select().from(businessSettings).where(eq(businessSettings.userId, userId));
    return settings || undefined;
  }

  async upsertBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings> {
    const existing = await this.getBusinessSettings(settings.userId);
    if (existing) {
      const [updated] = await db.update(businessSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(businessSettings.userId, settings.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(businessSettings).values(settings).returning();
      return created;
    }
  }

  async getFinancialSummary(userId: number, startDate: Date, endDate: Date): Promise<{
    totalIncome: string;
    totalExpense: string;
    netProfit: string;
    transactionCount: number;
  }> {
    const transactionsInRange = await this.getTransactionsByDateRange(userId, startDate, endDate);
    
    const totalIncome = transactionsInRange
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpense = transactionsInRange
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const netProfit = totalIncome - totalExpense;
    
    return {
      totalIncome: totalIncome.toString(),
      totalExpense: totalExpense.toString(),
      netProfit: netProfit.toString(),
      transactionCount: transactionsInRange.length,
    };
  }
}

export const storage = new DatabaseStorage();
