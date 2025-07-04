import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCustomerSchema, insertTransactionSchema, insertHppCalculationSchema, insertBusinessSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(userData.firebaseUid);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser(userData);

      // Create default categories
      await storage.createTransactionCategory({
        userId: user.id,
        name: "Penjualan",
        type: "income",
        color: "#10B981"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Jasa",
        type: "income",
        color: "#059669"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Operasional",
        type: "expense",
        color: "#EF4444"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Marketing",
        type: "expense",
        color: "#F97316"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Komisi",
        type: "income",
        color: "#14B8A6"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Penjualan Produk",
        type: "income",
        color: "#10B981"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Jasa/Layanan",
        type: "income",
        color: "#059669"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Bunga Bank",
        type: "income",
        color: "#0891B2"
      });

      await storage.createTransactionCategory({
        userId: user.id,
        name: "Lain-lain",
        type: "income",
        color: "#7C3AED"
      });

      res.json(user);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/user/:firebaseUid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const transactions = await storage.getTransactions(userId, limit);
      res.json(transactions);
    } catch (error: any) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const body = { ...req.body };
      // Convert date string to Date object if it's a string
      if (body.date && typeof body.date === 'string') {
        body.date = new Date(body.date);
      }

      const transactionData = insertTransactionSchema.parse(body);
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);
      const transactionData = insertTransactionSchema.partial().parse(req.body);

      const transaction = await storage.updateTransaction(id, transactionData, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);

      const success = await storage.deleteTransaction(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const customers = await storage.getCustomers(userId);
      res.json(customers);
    } catch (error: any) {
      console.error("Error getting customers:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error: any) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);
      const customerData = insertCustomerSchema.partial().parse(req.body);

      const customer = await storage.updateCustomer(id, customerData, userId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json(customer);
    } catch (error: any) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);

      const success = await storage.deleteCustomer(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Transaction categories routes
  app.get("/api/transaction-categories", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const categories = await storage.getTransactionCategories(userId);
      res.json(categories);
    } catch (error: any) {
      console.error("Error getting transaction categories:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // HPP calculations routes
  app.get("/api/hpp-calculations", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const calculations = await storage.getHppCalculations(userId);
      res.json(calculations);
    } catch (error: any) {
      console.error("Error getting HPP calculations:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/hpp-calculations", async (req, res) => {
    try {
      const calculationData = insertHppCalculationSchema.parse(req.body);
      const calculation = await storage.createHppCalculation(calculationData);
      res.json(calculation);
    } catch (error: any) {
      console.error("Error creating HPP calculation:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Business settings routes
  app.get("/api/business-settings", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const settings = await storage.getBusinessSettings(userId);
      res.json(settings || { userId, fixedCosts: "0", targetProfit: "0", averageSellingPrice: "0" });
    } catch (error: any) {
      console.error("Error getting business settings:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/business-settings", async (req, res) => {
    try {
      const settingsData = insertBusinessSettingsSchema.parse(req.body);
      const settings = await storage.upsertBusinessSettings(settingsData);
      res.json(settings);
    } catch (error: any) {
      console.error("Error saving business settings:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Financial summary route
  app.get("/api/financial-summary", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const summary = await storage.getFinancialSummary(userId, startDate, endDate);
      res.json(summary);
    } catch (error: any) {
      console.error("Error getting financial summary:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}