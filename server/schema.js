import { z } from 'zod';

// Base schemas - We'll validate ObjectId at runtime
export const objectIdSchema = z.string().refine((val) => {
  try {
    // This will work in server environment where ObjectId is available
    const { ObjectId } = require('mongodb');
    return ObjectId.isValid(val);
  } catch {
    // Fallback for client environment
    return /^[0-9a-fA-F]{24}$/.test(val);
  }
}, {
  message: 'Invalid ObjectId',
});

// User Schema
export const userSchema = z.object({
  _id: objectIdSchema.optional(),
  firebaseUid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  businessName: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

// Customer Schema
export const customerSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

// Transaction Category Schema
export const transactionCategorySchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  color: z.string().default('#059669'),
});

// Transaction Schema
export const transactionSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  customerId: objectIdSchema.optional(),
  categoryId: objectIdSchema.optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.date(),
  createdAt: z.date().default(() => new Date()),
});

// HPP Calculation Schema
export const hppCalculationSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  productName: z.string().min(1),
  rawMaterialCost: z.number().nonnegative(),
  laborCost: z.number().nonnegative(),
  overheadCost: z.number().nonnegative(),
  totalUnits: z.number().positive().int(),
  totalHPP: z.number().nonnegative(),
  hppPerUnit: z.number().nonnegative(),
  createdAt: z.date().default(() => new Date()),
});

// Business Settings Schema
export const businessSettingsSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  fixedCosts: z.number().nonnegative().default(0),
  targetProfit: z.number().nonnegative().default(0),
  averageSellingPrice: z.number().nonnegative().default(0),
  updatedAt: z.date().default(() => new Date()),
});

// Insert schemas (without _id for new documents)
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export const insertCustomerSchema = customerSchema.omit({ _id: true, createdAt: true });
export const insertTransactionCategorySchema = transactionCategorySchema.omit({ _id: true });
export const insertTransactionSchema = transactionSchema.omit({ _id: true, createdAt: true });
export const insertHppCalculationSchema = hppCalculationSchema.omit({ _id: true, createdAt: true });
export const insertBusinessSettingsSchema = businessSettingsSchema.omit({ _id: true, updatedAt: true });