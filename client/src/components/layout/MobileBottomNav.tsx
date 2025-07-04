import { Link, useLocation } from "wouter";
import { Home, TrendingUp, TrendingDown, Users, BarChart } from "lucide-react";

export function MobileBottomNav() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, current: location === "/" },
    { name: "Transaksi", href: "/transactions", icon: TrendingUp, current: location.includes("/transactions") },
    { name: "Pelanggan", href: "/customers", icon: Users, current: location === "/customers" },
    { name: "Laporan", href: "/reports", icon: BarChart, current: location === "/reports" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-40">
      <div className="grid grid-cols-5 py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex flex-col items-center py-2 transition-colors ${
                item.current ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
