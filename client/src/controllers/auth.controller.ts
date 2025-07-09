/**
 * Auth controller - handles authentication business logic
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';

// Auth queries
export const useAuthUser = (firebaseUid: string | null) => {
  return useQuery({
    queryKey: ['auth', 'user', firebaseUid],
    queryFn: () => authService.getUserByFirebaseUid(firebaseUid!),
    enabled: !!firebaseUid,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Auth mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userData: {
      firebaseUid: string;
      email: string;
      name: string;
    }) => authService.createUser(userData),
    onSuccess: (user) => {
      toast({
        title: 'Selamat datang!',
        description: 'Akun Anda berhasil dibuat',
      });
      queryClient.setQueryData(['auth', 'user', user.firebaseUid], user);
    },
    onError: (error) => {
      toast({
        title: 'Gagal membuat akun',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: Partial<User> }) =>
      authService.updateUserProfile(userId, data),
    onSuccess: (user) => {
      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      });
      queryClient.setQueryData(['auth', 'user', user.firebaseUid], user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
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

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Anda telah keluar dari akun',
      });
      queryClient.clear();
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