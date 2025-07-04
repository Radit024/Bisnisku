import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Customer, Transaction } from "@shared/schema";

export default function Customers() {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", dbUser?.id],
    enabled: !!dbUser?.id,
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customers/${id}?userId=${dbUser?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Pelanggan berhasil dihapus",
        description: "Data pelanggan telah dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus pelanggan",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const getCustomerStats = (customerId: number) => {
    const customerTransactions = transactions.filter(t => t.customerId === customerId);
    const totalSpent = customerTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const lastTransaction = customerTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    return {
      totalSpent,
      transactionCount: customerTransactions.length,
      lastTransaction: lastTransaction?.date,
    };
  };

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

  const handleFormSuccess = () => {
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Kelola Pelanggan</h2>
            <p className="text-muted-foreground mt-1">Kelola informasi pelanggan dan riwayat transaksi</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
              </DialogHeader>
              <CustomerForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pelanggan berdasarkan nama, email, atau telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{customers.length}</p>
              <p className="text-sm text-muted-foreground">Total Pelanggan</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                {customers.filter(c => getCustomerStats(c.id).transactionCount > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Pelanggan Aktif</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">
                {formatCurrency(
                  customers.reduce((total, customer) => 
                    total + getCustomerStats(customer.id).totalSpent, 0
                  )
                )}
              </p>
              <p className="text-sm text-muted-foreground">Total Penjualan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Pelanggan ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Tidak ada pelanggan yang sesuai dengan pencarian"
                  : "Belum ada pelanggan"
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm
                  ? "Coba kata kunci yang berbeda"
                  : "Mulai tambahkan pelanggan pertama Anda"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <Card key={customer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-lg">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{customer.name}</h3>
                            <Badge variant={stats.transactionCount > 0 ? "default" : "secondary"}>
                              {stats.transactionCount > 0 ? "Aktif" : "Belum Bertransaksi"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteCustomerMutation.mutate(customer.id)}
                            disabled={deleteCustomerMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {customer.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            {customer.email}
                          </div>
                        )}
                        
                        {customer.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            {customer.phone}
                          </div>
                        )}
                        
                        {customer.address && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            {customer.address.substring(0, 50)}
                            {customer.address.length > 50 && "..."}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatCurrency(stats.totalSpent)}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Pembelian</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {stats.transactionCount}
                            </p>
                            <p className="text-xs text-muted-foreground">Transaksi</p>
                          </div>
                        </div>
                        
                        {stats.lastTransaction && (
                          <div className="mt-3 text-center">
                            <p className="text-xs text-muted-foreground">
                              Transaksi terakhir: {formatDate(stats.lastTransaction)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
