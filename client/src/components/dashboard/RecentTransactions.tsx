import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "wouter";
import type { Transaction } from "@shared/schema";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Transaksi Terbaru</h3>
          <Link href="/transactions" className="text-primary hover:text-primary/80 text-sm font-medium">
            Lihat Semua
            <ArrowUp className="inline w-3 h-3 ml-1 rotate-45" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Belum ada transaksi</p>
            <p className="text-sm mt-1">Mulai tambahkan transaksi pertama Anda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                    transaction.type === 'income' 
                      ? 'bg-success/10' 
                      : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUp className="text-success" />
                    ) : (
                      <ArrowDown className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-success' : 'text-red-500'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
