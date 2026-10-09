'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import api from '@/lib/api';

export default function WishlistPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = () =>
        api.get('/wishlist').then(({ data }) => setProducts(data.items.map((i: any) => i.productId))).finally(() => setLoading(false));

    useEffect(() => { fetch(); }, []);

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold gradient-text mb-8 flex items-center gap-3">
                    <Heart className="text-red-400 fill-red-400" size={28} /> Wishlist
                </motion.h1>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-7xl mb-4">💝</div>
                        <p className="text-white/40 text-lg mb-4">Your wishlist is empty</p>
                        <a href="/" className="inline-block px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition">
                            Browse Products
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product, i) => (
                            <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <ProductCard product={product} inWishlist={true} onWishlistToggle={fetch} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
