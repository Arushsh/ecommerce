'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Product } from '@/types';
import { formatPrice, CATEGORY_MAP } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [inWishlist, setInWishlist] = useState(false);
    const { addToCart } = useCartStore();

    useEffect(() => {
        Promise.all([
            api.get(`/products/${id}`),
            api.get('/wishlist'),
        ]).then(([prod, wish]) => {
            setProduct(prod.data.product);
            const ids = new Set(wish.data.items.map((i: any) => i.productId._id));
            setInWishlist(ids.has(id));
        }).finally(() => setLoading(false));
    }, [id]);

    const toggleWishlist = async () => {
        try {
            if (inWishlist) {
                await api.delete(`/wishlist/${id}`);
                toast.success('Removed from wishlist');
            } else {
                await api.post('/wishlist', { productId: id });
                toast.success('Added to wishlist!');
            }
            setInWishlist(!inWishlist);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!product) return (
        <div className="text-center py-24 text-white/40">
            <p className="text-6xl mb-4">🔍</p>
            <p>Product not found</p>
        </div>
    );

    const discount = Math.round(((product.sellingPrice - product.discountedPrice) / product.sellingPrice) * 100);

    return (
        <ProtectedRoute>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 transition text-sm">
                    <ArrowLeft size={16} /> Back to Shop
                </Link>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Image */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="relative aspect-square rounded-3xl overflow-hidden glass">
                        <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                        {discount > 0 && (
                            <div className="absolute top-4 left-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                -{discount}% OFF
                            </div>
                        )}
                    </motion.div>

                    {/* Details */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                        <div>
                            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                                {CATEGORY_MAP[product.category] || product.category}
                            </span>
                            <h1 className="text-3xl font-extrabold text-white mt-1">{product.title}</h1>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} size={18} className={i <= 4 ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
                            ))}
                            <span className="text-white/40 text-sm">(4.0) • 128 reviews</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black gradient-text">{formatPrice(product.discountedPrice)}</span>
                            {discount > 0 && (
                                <span className="text-xl text-white/30 line-through pb-0.5">{formatPrice(product.sellingPrice)}</span>
                            )}
                        </div>

                        <p className="text-white/60 text-sm leading-relaxed">{product.description}</p>

                        {product.composition && (
                            <div className="glass rounded-xl p-4">
                                <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Composition</p>
                                <p className="text-sm text-white/70">{product.composition}</p>
                            </div>
                        )}

                        {product.prodapp && (
                            <div className="glass rounded-xl p-4">
                                <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Applications</p>
                                <p className="text-sm text-white/70">{product.prodapp}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-auto pt-2">
                            <button onClick={() => addToCart(product._id)}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition active:scale-95">
                                <ShoppingCart size={20} /> Add to Cart
                            </button>
                            <button onClick={toggleWishlist}
                                className={`p-3.5 rounded-2xl border transition ${inWishlist ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10 glass text-white/60 hover:text-red-400'}`}>
                                <Heart size={20} className={inWishlist ? 'fill-red-400' : ''} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
