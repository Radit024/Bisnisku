import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCreateTransaction, useTransactionCategories } from "@/controllers/transaction.controller";
import { useCustomers } from "@/controllers/customer.controller";
import { transactionValidationSchema } from "@/utils/validation";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { InsertTransaction, TransactionFormProps } from "@/types";

export function TransactionForm({ type, onSuccess }: TransactionFormProps) {
  const { dbUser } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  
  const createTransactionMutation = useCreateTransaction();
  const { data: categories = [] } = useTransactionCategories();
  const { data: customers = [] } = useCustomers();

  const form = useForm<InsertTransaction>({
    resolver: zodResolver(transactionValidationSchema),
    defaultValues: {
      userId: dbUser?.id || 0,
      type: type || "income",
      amount: 0,
      description: "",
      date: new Date(),
      categoryId: 0,
    },
  });

  const onSubmit = async (data: InsertTransaction) => {
    if (!dbUser) return;

    await createTransactionMutation.mutateAsync({
      ...data,
      userId: dbUser.id,
      date: date,
    });
    
    form.reset();
    onSuccess?.();
  };

  const filteredCategories = categories.filter(cat => cat.type === form.watch("type"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Tambah {form.watch("type") === "income" ? "Pemasukan" : "Pengeluaran"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Transaksi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (IDR)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0"
                      value={field.value ? new Intl.NumberFormat('id-ID').format(parseFloat(field.value.toString().replace(/\./g, ''))) : ''}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\./g, '');
                        if (numericValue === '' || /^\d+$/.test(numericValue)) {
                          field.onChange(numericValue);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi transaksi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "income" && (
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pelanggan (Opsional)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pelanggan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada pelanggan</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <FormLabel>Tanggal</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" disabled={createTransactionMutation.isPending} className="w-full">
              {createTransactionMutation.isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}