import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";

interface FinancialChartsProps {
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

export function FinancialCharts({ monthlyData, categoryData }: FinancialChartsProps) {
  const [monthlyPeriod, setMonthlyPeriod] = useState("6");
  const [categoryPeriod, setCategoryPeriod] = useState("current");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'income' ? 'Pemasukan' : 'Pengeluaran'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            {formatCurrency(data.value)} ({((data.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tren Bulanan</CardTitle>
            <Select value={monthlyPeriod} onValueChange={setMonthlyPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Bulan Terakhir</SelectItem>
                <SelectItem value="12">12 Bulan Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={formatCompactCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill="hsl(var(--success))" name="Pemasukan" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--destructive))" name="Pengeluaran" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada data untuk ditampilkan</p>
                <p className="text-xs mt-1">Tambahkan transaksi untuk melihat tren</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Kategori Pengeluaran</CardTitle>
            <Select value={categoryPeriod} onValueChange={setCategoryPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Bulan Ini</SelectItem>
                <SelectItem value="previous">Bulan Lalu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Category Legend */}
              <div className="mt-4 space-y-2">
                {categoryData.map((category, index) => {
                  const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = total > 0 ? ((category.value / total) * 100) : 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded mr-2" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm text-muted-foreground">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada data kategori</p>
                <p className="text-xs mt-1">Tambahkan pengeluaran untuk melihat distribusi</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
