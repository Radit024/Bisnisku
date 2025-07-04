import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { insertHppCalculationSchema, type InsertHppCalculation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export function HPPCalculator() {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{
    totalHPP: number;
    hppPerUnit: number;
  } | null>(null);

  const form = useForm<InsertHppCalculation>({
    resolver: zodResolver(insertHppCalculationSchema),
    defaultValues: {
      userId: dbUser?.id || 0,
      productName: "",
      rawMaterialCost: "",
      laborCost: "",
      overheadCost: "",
      totalUnits: 1,
      totalHPP: "",
      hppPerUnit: "",
    },
  });

  const calculateHPP = () => {
    const rawMaterial = parseFloat(form.getValues("rawMaterialCost")) || 0;
    const labor = parseFloat(form.getValues("laborCost")) || 0;
    const overhead = parseFloat(form.getValues("overheadCost")) || 0;
    const units = parseInt(form.getValues("totalUnits").toString()) || 1;

    const totalHPP = rawMaterial + labor + overhead;
    const hppPerUnit = totalHPP / units;

    setResult({ totalHPP, hppPerUnit });

    // Update form values
    form.setValue("totalHPP", totalHPP.toString());
    form.setValue("hppPerUnit", hppPerUnit.toString());
  };

  const saveCalculationMutation = useMutation({
    mutationFn: async (data: InsertHppCalculation) => {
      const response = await apiRequest("POST", "/api/hpp-calculations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hpp-calculations"] });
      toast({
        title: "Perhitungan HPP berhasil disimpan",
        description: "Data perhitungan telah disimpan",
      });
      form.reset();
      setResult(null);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menyimpan perhitungan",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertHppCalculation) => {
    if (!result) {
      toast({
        title: "Hitung HPP terlebih dahulu",
        description: "Silakan klik tombol 'Hitung HPP' sebelum menyimpan",
        variant: "destructive",
      });
      return;
    }

    saveCalculationMutation.mutate({
      ...data,
      userId: dbUser!.id,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kalkulator HPP (Harga Pokok Produksi)</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama produk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rawMaterialCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya Bahan Baku (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setResult(null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya Tenaga Kerja (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setResult(null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overheadCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya Overhead (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setResult(null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Unit Produksi</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value) || 1);
                          setResult(null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="button" onClick={calculateHPP} variant="outline" className="w-full">
              Hitung HPP
            </Button>

            {result && (
              <div className="bg-accent/5 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Hasil Perhitungan HPP</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bahan Baku:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(form.getValues("rawMaterialCost")) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenaga Kerja:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(form.getValues("laborCost")) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overhead:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(form.getValues("overheadCost")) || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total HPP:</span>
                    <span className="font-bold text-accent">{formatCurrency(result.totalHPP)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">HPP per Unit:</span>
                    <span className="font-semibold text-accent">{formatCurrency(result.hppPerUnit)}</span>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <Button type="submit" disabled={saveCalculationMutation.isPending} className="w-full">
                {saveCalculationMutation.isPending ? "Menyimpan..." : "Simpan Perhitungan"}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
