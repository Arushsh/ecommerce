'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import Image from 'next/image';

const STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Accepted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Packed: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'On the Way': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
    Cancel: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        api.get('/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
    }, []);

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold gradient-text mb-8">My Orders</motion.h1>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-7xl mb-4">📦</div>
                        <p className="text-white/40 text-lg mb-4">No orders yet</p>
                        <a href="/" className="inline-block px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition">
                            Start Shopping
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, i) => {
                            const isOpen = expandedId === order._id;
                            return (
                                <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }} className="glass rounded-2xl overflow-hidden">
                                    {/* Header Row */}
                                    <button onClick={() => setExpandedId(isOpen ? null : order._id)}
                                        className="w-full p-5 flex items-center justify-between gap-4 hover:bg-white/3 transition">
                                        <div className="flex items-center gap-3">
                                            <Package size={20} className="text-violet-400 flex-shrink-0" />
                                            <div className="text-left">
                                                <p className="font-semibold text-white text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                                                <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-auto">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] || 'bg-white/10 text-white/60'}`}>
                                                {order.status}
                                            </span>
                                            <span className="font-bold text-white hidden sm:block">{formatPrice(order.totalAmount)}</span>
                                            {isOpen ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    {isOpen && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }} className="border-t border-white/10 px-5 pb-5">
                                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                                {/* Items */}
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Items Ordered</p>
                                                    <div className="space-y-3">
                                                        {order.items.map((item, j) => (
                                                            <div key={j} className="flex items-center gap-3">
                                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                                                    <Image src={item.productSnapshot.imageUrl} alt={item.productSnapshot.title} fill className="object-cover" sizes="48px" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-white truncate">{item.productSnapshot.title}</p>
                                                                    <p className="text-xs text-white/40">Qty: {item.quantity} × {formatPrice(item.productSnapshot.discountedPrice)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Delivery Address */}
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Delivery To</p>
                                                    <div className="glass rounded-xl p-3 text-sm text-white/70 space-y-0.5">
                                                        <p className="font-semibold text-white">{order.addressSnapshot.name}</p>
                                                        <p>{order.addressSnapshot.locality}</p>
                                                        <p>{order.addressSnapshot.city}, {order.addressSnapshot.state}</p>
                                                        <p>{order.addressSnapshot.zipcode}</p>
                                                        <p>📞 {order.addressSnapshot.mobile}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-sm">
                                                <span className="text-white/40">Payment ID: {order.paymentId?.razorpayPaymentId || 'N/A'}</span>
                                                <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
