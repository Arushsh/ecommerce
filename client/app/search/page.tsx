'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Product } from '@/types';
import api from '@/lib/api';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!q) return;
        setLoading(true);
        api.get('/products', { params: { search: q } })
            .then(({ data }) => setProducts(data.products))
            .finally(() => setLoading(false));
    }, [q]);

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                        <Search size={16} /> Searching for
                    </div>
                    <h1 className="text-3xl font-bold text-white">"{q}"</h1>
                    {!loading && <p className="text-white/40 text-sm mt-1">{products.length} result{products.length !== 1 ? 's' : ''} found</p>}
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-7xl mb-4">🔍</div>
                        <p className="text-white/40 text-lg">No products found for "{q}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product, i) => (
                            <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
