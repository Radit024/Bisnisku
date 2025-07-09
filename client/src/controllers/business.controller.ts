/**
 * Business controller - handles business settings and HPP calculations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { useToast } from '@/hooks/use-toast';
import type { 
  BusinessSettings, 
  InsertBusinessSettings, 
  HppCalculation,
  InsertHppCalculation
} from '@/types';

// Business settings queries
export const useBusinessSettings = () => {
  return useQuery({
    queryKey: ['business-settings'],
    queryFn: () => businessService.getBusinessSettings(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Business settings mutations
export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertBusinessSettings) => businessService.updateBusinessSettings(data),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Pengaturan bisnis berhasil disimpan',
      });
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

// HPP calculations queries
export const useHppCalculations = () => {
  return useQuery({
    queryKey: ['hpp-calculations'],
    queryFn: () => businessService.getHppCalculations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useHppCalculation = (id: number) => {
  return useQuery({
    queryKey: ['hpp-calculations', id],
    queryFn: () => businessService.getHppCalculationById(id),
    enabled: !!id,
  });
};

// HPP calculations mutations
export const useCreateHppCalculation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertHppCalculation) => businessService.createHppCalculation(data),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Perhitungan HPP berhasil disimpan',
      });
      queryClient.invalidateQueries({ queryKey: ['hpp-calculations'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateHppCalculation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertHppCalculation> }) =>
      businessService.updateHppCalculation(id, data),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Perhitungan HPP berhasil diperbarui',
      });
      queryClient.invalidateQueries({ queryKey: ['hpp-calculations'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteHppCalculation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => businessService.deleteHppCalculation(id),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Perhitungan HPP berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['hpp-calculations'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};