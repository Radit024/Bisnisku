/**
 * Transaction controller - handles business logic for transactions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';
import { formatValidationError } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';
import type { 
  Transaction, 
  InsertTransaction, 
  TransactionCategory,
  InsertTransactionCategory,
  DateRangeFilter,
  FinancialSummaryData
} from '@/types';

// Transaction queries
export const useTransactions = (limit?: number) => {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: () => transactionService.getTransactions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
  });
};

export const useTransactionsByDateRange = (dateRange: DateRangeFilter) => {
  return useQuery({
    queryKey: ['transactions', 'date-range', dateRange],
    queryFn: () => transactionService.getTransactionsByDateRange(dateRange),
  });
};

export const useTransactionCategories = () => {
  return useQuery({
    queryKey: ['transaction-categories'],
    queryFn: () => transactionService.getTransactionCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFinancialSummary = (dateRange?: DateRangeFilter) => {
  return useQuery({
    queryKey: ['financial-summary', dateRange],
    queryFn: () => transactionService.getFinancialSummary(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Transaction mutations
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertTransaction) => transactionService.createTransaction(data),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Transaksi berhasil ditambahkan',
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTransaction> }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Transaksi berhasil diperbarui',
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Transaksi berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateTransactionCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertTransactionCategory) => transactionService.createTransactionCategory(data),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Kategori berhasil ditambahkan',
      });
      queryClient.invalidateQueries({ queryKey: ['transaction-categories'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

// Analytics hooks
export const useIncomeByCategory = (dateRange?: DateRangeFilter) => {
  return useQuery({
    queryKey: ['analytics', 'income-by-category', dateRange],
    queryFn: () => transactionService.getIncomeByCategory(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExpenseByCategory = (dateRange?: DateRangeFilter) => {
  return useQuery({
    queryKey: ['analytics', 'expense-by-category', dateRange],
    queryFn: () => transactionService.getExpenseByCategory(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMonthlyTransactionData = (months: number = 12) => {
  return useQuery({
    queryKey: ['analytics', 'monthly-data', months],
    queryFn: () => transactionService.getMonthlyTransactionData(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};