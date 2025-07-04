import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, UserPlus, Calculator, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface QuickActionsProps {
  profitRatio: number;
  costEfficiency: number;
}

export function QuickActions({ profitRatio, costEfficiency }: QuickActionsProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            asChild
            variant="outline" 
            className="w-full justify-between group hover:bg-primary/5 hover:border-primary"
          >
            <Link href="/transactions?type=income">
              <div className="flex items-center">
                <Plus className="text-primary mr-3 w-4 h-4" />
                <span className="font-medium">Tambah Pemasukan</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            className="w-full justify-between group hover:bg-red-50 hover:border-red-200"
          >
            <Link href="/transactions?type=expense">
              <div className="flex items-center">
                <Minus className="text-red-500 mr-3 w-4 h-4" />
                <span className="font-medium">Tambah Pengeluaran</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            className="w-full justify-between group hover:bg-secondary/5 hover:border-secondary"
          >
            <Link href="/customers">
              <div className="flex items-center">
                <UserPlus className="text-secondary mr-3 w-4 h-4" />
                <span className="font-medium">Tambah Pelanggan</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            className="w-full justify-between group hover:bg-accent/5 hover:border-accent"
          >
            <Link href="/reports">
              <div className="flex items-center">
                <Calculator className="text-accent mr-3 w-4 h-4" />
                <span className="font-medium">Hitung HPP</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Financial Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kesehatan Keuangan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Rasio Keuntungan</span>
              <span className="text-sm font-semibold text-success">{profitRatio.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(profitRatio, 100)} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Efisiensi Biaya</span>
              <span className="text-sm font-semibold text-secondary">{costEfficiency.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(costEfficiency, 100)} className="h-2" />
          </div>
          
          <div className="mt-4 p-3 bg-success/5 rounded-lg">
            <p className="text-sm text-success font-medium">
              <CheckCircle className="inline w-4 h-4 mr-2" />
              Keuangan bisnis Anda dalam kondisi sehat!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
