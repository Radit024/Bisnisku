import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Plus } from "lucide-react";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FinancialCharts } from "@/components/dashboard/FinancialCharts";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Transaction, Customer } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { dbUser } = useAuth();

  // Get current month date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Fetch recent transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  // Fetch financial summary
  const { data: financialSummary = {
    totalIncome: "0",
    totalExpense: "0",
    netProfit: "0",
    transactionCount: 0,
  } } = useQuery({
    queryKey: ["/api/financial-summary", dbUser?.id, startOfMonth.toISOString(), endOfMonth.toISOString()],
    enabled: !!dbUser?.id,
  });

  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  // Fetch business settings for BEP calculation
  const { data: businessSettings } = useQuery({
    queryKey: ["/api/business-settings", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  // Calculate metrics
  const totalIncome = parseFloat(financialSummary.totalIncome);
  const totalExpense = parseFloat(financialSummary.totalExpense);
  const netProfit = parseFloat(financialSummary.netProfit);
  const breakEvenPoint = parseFloat(businessSettings?.fixedCosts || "0");

  const profitRatio = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const costEfficiency = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Prepare chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === date.getMonth() && 
             transactionDate.getFullYear() === date.getFullYear();
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date),
      income,
      expense,
    };
  }).reverse();

  // Category data for pie chart
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryData = [
    { name: "Operasional", value: expenseTransactions.length > 0 ? totalExpense * 0.45 : 0, color: "#059669" },
    { name: "Marketing", value: expenseTransactions.length > 0 ? totalExpense * 0.30 : 0, color: "#3B82F6" },
    { name: "Administrasi", value: expenseTransactions.length > 0 ? totalExpense * 0.25 : 0, color: "#6366F1" },
  ];

  const recentTransactions = transactions.slice(0, 5);
  const recentCustomers = customers.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dashboard Keuangan</h2>
            <p className="text-muted-foreground mt-1">Ringkasan bisnis Anda hari ini</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline" className="text-sm">
              <Download className="mr-2 h-4 w-4" />
              Ekspor Data
            </Button>
            <Button asChild className="text-sm">
              <Link href="/transactions">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Transaksi
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <DashboardCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netProfit={netProfit}
        breakEvenPoint={breakEvenPoint}
        incomeGrowth={12}
        expenseGrowth={8}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Transactions */}
        <RecentTransactions transactions={recentTransactions} />

        {/* Quick Actions */}
        <QuickActions 
          profitRatio={profitRatio}
          costEfficiency={costEfficiency}
        />
      </div>

      {/* Charts */}
      <FinancialCharts
        monthlyData={monthlyData}
        categoryData={categoryData}
      />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Customers */}
        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Pelanggan Terbaru</h3>
              <Link href="/customers" className="text-primary hover:text-primary/80 text-sm font-medium">
                Kelola Pelanggan
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
          <CardContent className="p-6">
            {recentCustomers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Belum ada pelanggan</p>
                <p className="text-sm mt-1">Tambahkan pelanggan pertama Anda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email || "Tidak ada email"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">Pelanggan Baru</p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("id-ID", { 
                          day: "numeric", 
                          month: "short" 
                        }).format(new Date(customer.createdAt))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* HPP Calculator Preview */}
        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Kalkulator HPP</h3>
              <Link href="/reports" className="text-accent hover:text-accent/80 text-sm font-medium">
                Buka Kalkulator
                <span className="ml-1">↗</span>
              </Link>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="bg-accent/5 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bahan Baku:</span>
                  <span className="font-medium">Rp 450.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenaga Kerja:</span>
                  <span className="font-medium">Rp 200.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overhead:</span>
                  <span className="font-medium">Rp 100.000</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total HPP:</span>
                    <span className="font-bold text-accent">Rp 750.000</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                HPP per unit: <span className="font-semibold text-foreground">Rp 15.000</span>
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/reports">
                  <Calculator className="mr-2 h-4 w-4" />
                  Hitung Ulang HPP
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Calculator({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="16" y2="18"/>
    </svg>
  );
}
