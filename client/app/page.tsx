'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Product } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import api from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const fetchProducts = async (category = '') => {
    setLoading(true);
    try {
      const params: any = {};
      if (category) params.category = category;
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlistIds(new Set(data.items.map((i: any) => i.productId._id)));
    } catch { }
  };

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

  const handleCategory = (code: string) => {
    const next = activeCategory === code ? '' : code;
    setActiveCategory(next);
    fetchProducts(next);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-4">
            🚀 Fresh from the Farm
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-4">
            Premium Dairy
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Pure, natural dairy products delivered straight to your door.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => handleCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === '' ? 'bg-violet-600 text-white' : 'glass text-white/60 hover:text-white'
              }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.code}
              onClick={() => handleCategory(cat.code)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat.code ? 'bg-violet-600 text-white' : 'glass text-white/60 hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="shimmer aspect-square rounded-t-2xl" />
                <div className="p-4 glass rounded-b-2xl space-y-2">
                  <div className="shimmer h-3 w-1/2 rounded" />
                  <div className="shimmer h-4 w-3/4 rounded" />
                  <div className="shimmer h-4 w-1/3 rounded" />
                  <div className="shimmer h-9 w-full rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="text-6xl mb-4">🫙</p>
            <p className="text-lg">No products found</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard
                  product={product}
                  inWishlist={wishlistIds.has(product._id)}
                  onWishlistToggle={fetchWishlist}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
