'use client';
import { create } from 'zustand';
import { CartData } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CartState {
    cart: CartData | null;
    isLoading: boolean;
    fetchCart: () => Promise<void>;
    addToCart: (productId: string) => Promise<void>;
    plusItem: (productId: string) => Promise<void>;
    minusItem: (productId: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
    cart: null,
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/cart');
            set({ cart: data });
        } catch {
            set({ cart: null });
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: async (productId) => {
        try {
            const { data } = await api.post('/cart', { productId });
            set({ cart: data });
            toast.success('Added to cart!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    },

    plusItem: async (productId) => {
        try {
            const { data } = await api.put(`/cart/${productId}/plus`);
            set({ cart: data });
        } catch {
            toast.error('Failed to update cart');
        }
    },

    minusItem: async (productId) => {
        try {
            const { data } = await api.put(`/cart/${productId}/minus`);
            set({ cart: data });
        } catch {
            toast.error('Failed to update cart');
        }
    },

    removeItem: async (productId) => {
        try {
            const { data } = await api.delete(`/cart/${productId}`);
            set({ cart: data });
            toast.success('Removed from cart');
        } catch {
            toast.error('Failed to remove item');
        }
    },
}));
