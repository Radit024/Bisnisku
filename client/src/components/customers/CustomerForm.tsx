import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCreateCustomer } from "@/controllers/customer.controller";
import { customerValidationSchema } from "@/utils/validation";
import type { InsertCustomer, CustomerFormProps } from "@/types";

export function CustomerForm({ onSuccess }: CustomerFormProps) {
  const { dbUser } = useAuth();
  const createCustomerMutation = useCreateCustomer();

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(customerValidationSchema),
    defaultValues: {
      userId: dbUser?.id || 0,
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (data: InsertCustomer) => {
    if (!dbUser) return;

    await createCustomerMutation.mutateAsync({
      ...data,
      userId: dbUser.id,
    });
    
    form.reset();
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pelanggan Baru</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pelanggan</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama pelanggan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="nama@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan alamat pelanggan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createCustomerMutation.isPending} className="w-full">
              {createCustomerMutation.isPending ? "Menyimpan..." : "Simpan Pelanggan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
