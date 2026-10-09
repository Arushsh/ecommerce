'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    initialized: boolean;       // true once fetchMe has run at least once
    setUser: (user: User | null) => void;
    fetchMe: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            initialized: false,

            setUser: (user) => set({ user }),

            fetchMe: async () => {
                set({ isLoading: true });
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data.user, initialized: true });
                } catch {
                    set({ user: null, initialized: true });
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                await api.post('/auth/logout');
                set({ user: null });
                window.location.href = '/login';
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
