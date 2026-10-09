'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, CATEGORY_MAP } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
    product: Product;
    inWishlist?: boolean;
    onWishlistToggle?: () => void;
}

export default function ProductCard({ product, inWishlist, onWishlistToggle }: Props) {
    const { addToCart } = useCartStore();
    const user = useAuthStore((s) => s.user);

    const discount = Math.round(((product.sellingPrice - product.discountedPrice) / product.sellingPrice) * 100);

    const handleWishlist = async () => {
        if (!user) { toast.error('Please login first'); return; }
        try {
            if (inWishlist) {
                await api.delete(`/wishlist/${product._id}`);
                toast.success('Removed from wishlist');
            } else {
                await api.post('/wishlist', { productId: product._id });
                toast.success('Added to wishlist!');
            }
            onWishlistToggle?.();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="glass rounded-2xl overflow-hidden group"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-white/5">
                <Link href={`/product/${product._id}`}>
                    <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                </Link>
                {/* Discount badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discount}%
                    </div>
                )}
                {/* Wishlist button */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 p-2 rounded-full glass opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Heart
                        size={16}
                        className={inWishlist ? 'fill-red-400 text-red-400' : 'text-white/70'}
                    />
                </button>
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-xs text-violet-400 font-medium mb-1 uppercase tracking-wide">
                    {CATEGORY_MAP[product.category] || product.category}
                </p>
                <Link href={`/product/${product._id}`}>
                    <h3 className="font-semibold text-white line-clamp-1 hover:text-violet-300 transition">
                        {product.title}
                    </h3>
                </Link>

                {/* Pricing */}
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-white">{formatPrice(product.discountedPrice)}</span>
                    {discount > 0 && (
                        <span className="text-sm text-white/40 line-through">{formatPrice(product.sellingPrice)}</span>
                    )}
                </div>

                {/* Stars (static for now) */}
                <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={12} className={i <= 4 ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
                    ))}
                    <span className="text-xs text-white/40 ml-1">(4.0)</span>
                </div>

                {/* Add to cart */}
                <button
                    onClick={() => addToCart(product._id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition active:scale-95"
                >
                    <ShoppingCart size={15} />
                    Add to Cart
                </button>
            </div>
        </motion.div>
    );
}
