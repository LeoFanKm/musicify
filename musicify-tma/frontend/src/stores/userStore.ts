import { create } from 'zustand';
import { User, UserUsage } from '@shared/types';
import { api } from '../utils/api';

interface UserState {
  user: User | null;
  usage: UserUsage | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  fetchUsage: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  usage: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<User>('/user/me');
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false,
      });
    }
  },

  fetchUsage: async () => {
    try {
      const response = await api.get<UserUsage>('/user/usage');
      set({ usage: response.data });
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  },
}));
