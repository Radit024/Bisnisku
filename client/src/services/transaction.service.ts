/**
 * Transaction service
 */

import { ApiService } from './api';
import { queryClient } from '@/lib/queryClient';
import type { 
  Transaction, 
  InsertTransaction, 
  TransactionCategory,
  InsertTransactionCategory,
  DateRangeFilter,
  FinancialSummaryData
} from '@/types';

class TransactionService extends ApiService {
  constructor() {
    super(import.meta.env.VITE_API_URL || '', queryClient);
  }

  // Transaction operations
  async getTransactions(limit?: number): Promise<Transaction[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.get<Transaction[]>(`/transactions${query}`);
  }

  async getTransactionById(id: number): Promise<Transaction> {
    return this.get<Transaction>(`/transactions/${id}`);
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const transaction = await this.post<Transaction>('/transactions', transactionData);
    this.invalidateQueries(['transactions']);
    this.invalidateQueries(['financial-summary']);
    return transaction;
  }

  async updateTransaction(id: number, transactionData: Partial<InsertTransaction>): Promise<Transaction> {
    const transaction = await this.patch<Transaction>(`/transactions/${id}`, transactionData);
    this.invalidateQueries(['transactions']);
    this.invalidateQueries(['financial-summary']);
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.delete(`/transactions/${id}`);
    this.invalidateQueries(['transactions']);
    this.invalidateQueries(['financial-summary']);
  }

  async getTransactionsByDateRange(dateRange: DateRangeFilter): Promise<Transaction[]> {
    const params = new URLSearchParams({
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    });
    return this.get<Transaction[]>(`/transactions/date-range?${params}`);
  }

  // Transaction categories
  async getTransactionCategories(): Promise<TransactionCategory[]> {
    return this.get<TransactionCategory[]>('/transaction-categories');
  }

  async createTransactionCategory(categoryData: InsertTransactionCategory): Promise<TransactionCategory> {
    const category = await this.post<TransactionCategory>('/transaction-categories', categoryData);
    this.invalidateQueries(['transaction-categories']);
    return category;
  }

  // Financial summary
  async getFinancialSummary(dateRange?: DateRangeFilter): Promise<FinancialSummaryData> {
    if (dateRange) {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });
      return this.get<FinancialSummaryData>(`/financial-summary?${params}`);
    }
    return this.get<FinancialSummaryData>('/financial-summary');
  }

  // Transaction analytics
  async getIncomeByCategory(dateRange?: DateRangeFilter): Promise<Array<{ name: string; value: number }>> {
    const transactions = dateRange 
      ? await this.getTransactionsByDateRange(dateRange)
      : await this.getTransactions();
    
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const categoryMap = new Map<string, number>();
    
    incomeTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Lainnya';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + parseFloat(transaction.amount));
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }

  async getExpenseByCategory(dateRange?: DateRangeFilter): Promise<Array<{ name: string; value: number }>> {
    const transactions = dateRange 
      ? await this.getTransactionsByDateRange(dateRange)
      : await this.getTransactions();
    
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();
    
    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Lainnya';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + parseFloat(transaction.amount));
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }

  async getMonthlyTransactionData(months: number = 12): Promise<Array<{ month: string; income: number; expense: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const transactions = await this.getTransactionsByDateRange({ startDate, endDate });
    const monthlyData = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { income: 0, expense: 0 });
      }
      
      const data = monthlyData.get(month)!;
      const amount = parseFloat(transaction.amount);
      
      if (transaction.type === 'income') {
        data.income += amount;
      } else {
        data.expense += amount;
      }
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data
    }));
  }

  // Cache management
  invalidateTransactionCache(): void {
    this.invalidateQueries(['transactions']);
    this.invalidateQueries(['transaction-categories']);
    this.invalidateQueries(['financial-summary']);
  }
}

export const transactionService = new TransactionService();