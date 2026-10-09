'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
    const { cart, isLoading, fetchCart, plusItem, minusItem, removeItem } = useCartStore();

    useEffect(() => { fetchCart(); }, []);

    return (
        <ProtectedRoute>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold gradient-text mb-8">
                    Your Cart
                </motion.h1>

                {isLoading ? (
                    <div className="flex justify-center py-24">
                        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : !cart || cart.items.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-7xl mb-4">🛒</div>
                        <p className="text-white/40 text-lg mb-6">Your cart is empty</p>
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition">
                            <ShoppingBag size={18} /> Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence>
                                {cart.items.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                        className="glass rounded-2xl p-4 flex items-center gap-4"
                                    >
                                        {/* Image */}
                                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
                                            <Image src={item.productId.imageUrl} alt={item.productId.title}
                                                fill className="object-cover" sizes="80px" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">{item.productId.title}</h3>
                                            <p className="text-violet-400 text-sm">{formatPrice(item.productId.discountedPrice)}</p>
                                            <p className="text-white/40 text-xs mt-0.5">
                                                Subtotal: {formatPrice(item.quantity * item.productId.discountedPrice)}
                                            </p>
                                        </div>

                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => minusItem(item.productId._id)}
                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                            <button onClick={() => plusItem(item.productId._id)}
                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button onClick={() => removeItem(item.productId._id)}
                                            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-2xl p-6 sticky top-24">
                                <h2 className="text-lg font-bold mb-5">Order Summary</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-white/60">
                                        <span>Subtotal ({cart.items.length} items)</span>
                                        <span>{formatPrice(cart.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/60">
                                        <span>Delivery</span>
                                        <span>{cart.delivery === 0 ? 'Free' : formatPrice(cart.delivery)}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white text-base">
                                        <span>Total</span>
                                        <span className="gradient-text">{formatPrice(cart.total)}</span>
                                    </div>
                                </div>
                                <Link href="/checkout"
                                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition active:scale-95">
                                    Proceed to Checkout <ArrowRight size={16} />
                                </Link>
                                <Link href="/" className="block text-center text-white/40 hover:text-white/60 text-sm mt-3 transition">
                                    Continue Shopping
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
