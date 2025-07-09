/**
 * Validation schemas for forms
 */
import { z } from "zod";
import { insertCustomerSchema, insertTransactionSchema, insertBusinessSettingsSchema } from "@shared/schema";

export const customerValidationSchema = insertCustomerSchema.extend({
  name: z.string().min(2, "Nama pelanggan harus minimal 2 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const transactionValidationSchema = insertTransactionSchema.extend({
  amount: z.coerce.number().min(0.01, "Jumlah harus lebih dari 0"),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  categoryId: z.coerce.number().min(1, "Kategori wajib dipilih"),
});

export const businessSettingsValidationSchema = insertBusinessSettingsSchema.extend({
  businessName: z.string().min(2, "Nama bisnis harus minimal 2 karakter"),
  businessType: z.string().min(1, "Jenis bisnis wajib dipilih"),
  currency: z.string().min(1, "Mata uang wajib dipilih"),
  taxRate: z.coerce.number().min(0).max(100, "Tarif pajak tidak boleh lebih dari 100%"),
});

export const profileValidationSchema = z.object({
  name: z.string().min(2, "Nama harus minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().optional(),
  address: z.string().optional(),
});