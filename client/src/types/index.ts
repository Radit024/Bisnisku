// Re-export all types from shared schema for client usage
export type {
  User,
  InsertUser,
  Customer,
  InsertCustomer,
  Transaction,
  InsertTransaction,
  TransactionCategory,
  InsertTransactionCategory,
  HppCalculation,
  InsertHppCalculation,
  BusinessSettings,
  InsertBusinessSettings,
} from '@shared/schema';

// Client-specific types
export interface AuthContextType {
  user: User | null;
  dbUser: User | null;
  loading: boolean;
}

export interface DashboardCardsProps {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  breakEvenPoint: number;
  incomeGrowth?: number;
  expenseGrowth?: number;
}

export interface FinancialChartsProps {
  monthlyData: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export interface QuickActionsProps {
  profitRatio: number;
  costEfficiency: number;
}

export interface RecentTransactionsProps {
  transactions: Transaction[];
}

export interface CustomerFormProps {
  onSuccess?: () => void;
}

export interface TransactionFormProps {
  type?: "income" | "expense";
  onSuccess?: () => void;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface FinancialSummaryData {
  totalIncome: string;
  totalExpense: string;
  netProfit: string;
  transactionCount: number;
}

export interface HPPCalculationData {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  sellingPrice: number;
  profitMargin: number;
  productName: string;
  quantity: number;
}

export interface BEPCalculationData {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
}