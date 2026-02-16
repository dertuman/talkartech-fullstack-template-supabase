'use client';

import { createContext, ReactNode, useContext } from 'react';
import { User } from '@/models/UserModel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface UserDataContextType {
  userData: User | null;
  isLoading: boolean;
  error?: string;
  refreshUserData: () => void;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { status } = useSession();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery<{ data: User }>({
    queryKey: ['userData'],
    queryFn: async () => {
      const response = await axios.get('/api/users/get-user-data-private');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    enabled: status === 'authenticated', // Only run query if user is authenticated
  });

  const refreshUserData = () => {
    queryClient.invalidateQueries({ queryKey: ['userData'] });
  };

  return (
    <UserDataContext.Provider
      value={{
        userData: userData?.data || null,
        isLoading,
        error: error?.message,
        refreshUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
