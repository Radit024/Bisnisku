import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { Navigation } from "@/components/layout/Navigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Customers from "@/pages/Customers";
import Reports from "@/pages/Reports";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat aplikasi...</p>
      </div>
    </div>
  );
}

function Router() {
  const { user, dbUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login />;
  }

  // Wait for dbUser to be loaded before rendering the main app
  if (user && !dbUser) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/customers" component={Customers} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileBottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
