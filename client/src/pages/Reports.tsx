import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { HPPCalculator } from "@/components/calculators/HPPCalculator";
import { FinancialCharts } from "@/components/dashboard/FinancialCharts";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Transaction, HppCalculation, BusinessSettings } from "@shared/schema";

export default function Reports() {
  const { dbUser } = useAuth();
  const [reportPeriod, setReportPeriod] = useState("current-month");

  // Get date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    switch (reportPeriod) {
      case "current-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last-3-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case "current-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch data
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  const { data: financialSummary = {
    totalIncome: "0",
    totalExpense: "0",
    netProfit: "0",
    transactionCount: 0,
  } } = useQuery({
    queryKey: ["/api/financial-summary", dbUser?.id, startDate.toISOString(), endDate.toISOString()],
    enabled: !!dbUser?.id,
  });

  const { data: hppCalculations = [] } = useQuery<HppCalculation[]>({
    queryKey: ["/api/hpp-calculations", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  const { data: businessSettings } = useQuery<BusinessSettings>({
    queryKey: ["/api/business-settings", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  // Calculate metrics
  const totalIncome = parseFloat(financialSummary.totalIncome);
  const totalExpense = parseFloat(financialSummary.totalExpense);
  const netProfit = parseFloat(financialSummary.netProfit);
  const fixedCosts = parseFloat(businessSettings?.fixedCosts || "0");
  const averageSellingPrice = parseFloat(businessSettings?.averageSellingPrice || "0");

  // Calculate Break Even Point
  const variableCostPerUnit = totalExpense > 0 && transactions.length > 0 
    ? totalExpense / transactions.filter(t => t.type === 'income').length 
    : 0;
  
  const contributionMarginPerUnit = averageSellingPrice - variableCostPerUnit;
  const breakEvenUnits = contributionMarginPerUnit > 0 ? fixedCosts / contributionMarginPerUnit : 0;
  const breakEvenRevenue = breakEvenUnits * averageSellingPrice;

  // Prepare chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
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

  // Category data for expenses
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryData = [
    { name: "Operasional", value: expenseTransactions.length > 0 ? totalExpense * 0.45 : 0, color: "#059669" },
    { name: "Marketing", value: expenseTransactions.length > 0 ? totalExpense * 0.30 : 0, color: "#3B82F6" },
    { name: "Administrasi", value: expenseTransactions.length > 0 ? totalExpense * 0.25 : 0, color: "#6366F1" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case "current-month": return "Bulan Ini";
      case "last-month": return "Bulan Lalu";
      case "last-3-months": return "3 Bulan Terakhir";
      case "current-year": return "Tahun Ini";
      default: return "Bulan Ini";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Laporan & Analisis</h2>
            <p className="text-muted-foreground mt-1">Analisis keuangan dan perhitungan bisnis</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Bulan Ini</SelectItem>
                <SelectItem value="last-month">Bulan Lalu</SelectItem>
                <SelectItem value="last-3-months">3 Bulan Terakhir</SelectItem>
                <SelectItem value="current-year">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Ekspor PDF
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="financial-report" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial-report">Laporan Keuangan</TabsTrigger>
          <TabsTrigger value="bep-analysis">Analisis BEP</TabsTrigger>
          <TabsTrigger value="hpp-calculator">Kalkulator HPP</TabsTrigger>
        </TabsList>

        <TabsContent value="financial-report" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pemasukan</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Keuntungan Bersih</p>
                    <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(netProfit)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</p>
                    <p className="text-2xl font-bold text-foreground">{financialSummary.transactionCount}</p>
                  </div>
                  <Calculator className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Period Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Periode Laporan: {getPeriodLabel()}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </p>
                </div>
                <Badge variant="outline">
                  {financialSummary.transactionCount} transaksi
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <FinancialCharts
            monthlyData={monthlyData}
            categoryData={categoryData}
          />

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Rasio Keuangan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Margin Keuntungan</span>
                  <span className="font-semibold">
                    {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rasio Pengeluaran</span>
                  <span className="font-semibold">
                    {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ROI (Return on Investment)</span>
                  <span className="font-semibold">
                    {totalExpense > 0 ? ((netProfit / totalExpense) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tren Kinerja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rata-rata Transaksi</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      financialSummary.transactionCount > 0 
                        ? totalIncome / financialSummary.transactionCount 
                        : 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pertumbuhan Bulanan</span>
                  <Badge variant={netProfit > 0 ? "default" : "destructive"}>
                    {netProfit > 0 ? "Positif" : "Negatif"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status Keuangan</span>
                  <Badge variant={netProfit > totalIncome * 0.2 ? "default" : "secondary"}>
                    {netProfit > totalIncome * 0.2 ? "Sehat" : "Perlu Perhatian"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bep-analysis" className="space-y-6">
          {/* BEP Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Analisis Break Even Point (BEP)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biaya Tetap:</span>
                    <span className="font-medium">{formatCurrency(fixedCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Jual Rata-rata:</span>
                    <span className="font-medium">{formatCurrency(averageSellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biaya Variabel per Unit:</span>
                    <span className="font-medium">{formatCurrency(variableCostPerUnit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin Kontribusi per Unit:</span>
                    <span className="font-medium">{formatCurrency(contributionMarginPerUnit)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Hasil BEP:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>BEP dalam Unit:</span>
                        <span className="font-bold text-primary">
                          {Math.ceil(breakEvenUnits).toLocaleString("id-ID")} unit
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>BEP dalam Rupiah:</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(breakEvenRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    {totalIncome >= breakEvenRevenue 
                      ? "✅ BEP sudah tercapai bulan ini!" 
                      : `💡 Perlu ${formatCurrency(breakEvenRevenue - totalIncome)} lagi untuk mencapai BEP`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target & Proyeksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Progress BEP Bulan Ini</span>
                      <span className="text-sm font-medium">
                        {breakEvenRevenue > 0 ? ((totalIncome / breakEvenRevenue) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min((totalIncome / breakEvenRevenue) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {Math.ceil((breakEvenRevenue - totalIncome) / averageSellingPrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">Unit lagi untuk BEP</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {Math.ceil(30 - (new Date().getDate()))}
                      </p>
                      <p className="text-xs text-muted-foreground">Hari tersisa bulan ini</p>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-accent/5 rounded-lg">
                    <h5 className="font-medium mb-2">Rekomendasi:</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Fokus pada penjualan produk dengan margin tinggi</li>
                      <li>• Optimalkan efisiensi operasional</li>
                      <li>• Pertimbangkan strategi pemasaran yang tepat sasaran</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hpp-calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* HPP Calculator */}
            <div>
              <HPPCalculator />
            </div>

            {/* HPP History */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Perhitungan HPP</CardTitle>
              </CardHeader>
              <CardContent>
                {hppCalculations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Belum ada perhitungan HPP</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gunakan kalkulator di sebelah untuk mulai menghitung HPP
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hppCalculations.slice(0, 5).map((calculation) => (
                      <div key={calculation.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">{calculation.productName}</h4>
                          <Badge variant="outline">
                            {formatDate(calculation.createdAt)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total HPP:</p>
                            <p className="font-semibold">{formatCurrency(parseFloat(calculation.totalHPP))}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">HPP per Unit:</p>
                            <p className="font-semibold">{formatCurrency(parseFloat(calculation.hppPerUnit))}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          <div className="grid grid-cols-3 gap-2">
                            <span>Bahan: {formatCurrency(parseFloat(calculation.rawMaterialCost))}</span>
                            <span>Tenaga: {formatCurrency(parseFloat(calculation.laborCost))}</span>
                            <span>Overhead: {formatCurrency(parseFloat(calculation.overheadCost))}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {hppCalculations.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          Lihat Semua Perhitungan
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
