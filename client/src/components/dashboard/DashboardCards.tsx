import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, PieChart, Scale } from "lucide-react";

interface DashboardCardsProps {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  breakEvenPoint: number;
  incomeGrowth?: number;
  expenseGrowth?: number;
}

export function DashboardCards({
  totalIncome,
  totalExpense,
  netProfit,
  breakEvenPoint,
  incomeGrowth = 0,
  expenseGrowth = 0,
}: DashboardCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;
  const isBreakEvenReached = totalIncome >= breakEvenPoint;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Pemasukan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <ArrowUp className="text-success text-xl" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pemasukan</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalIncome)}</p>
              <p className="text-sm text-success mt-1">
                <ArrowUp className="inline w-3 h-3 mr-1" />
                +{incomeGrowth.toFixed(1)}% bulan ini
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Pengeluaran */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowDown className="text-red-500 text-xl" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalExpense)}</p>
              <p className="text-sm text-red-500 mt-1">
                <ArrowUp className="inline w-3 h-3 mr-1" />
                +{expenseGrowth.toFixed(1)}% bulan ini
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keuntungan Bersih */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <PieChart className="text-primary text-xl" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Keuntungan Bersih</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(netProfit)}</p>
              <p className="text-sm text-success mt-1">
                <ArrowUp className="inline w-3 h-3 mr-1" />
                {profitMargin.toFixed(1)}% margin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break Even Point */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Scale className="text-accent text-xl" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Break Even Point</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(breakEvenPoint)}</p>
              <p className={`text-sm mt-1 ${isBreakEvenReached ? 'text-success' : 'text-red-500'}`}>
                {isBreakEvenReached ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-success rounded-full mr-2"></span>
                    Tercapai bulan ini
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Belum tercapai
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
