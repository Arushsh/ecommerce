'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function SellerDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/seller/stats').then(({ data }) => setData(data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-24"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

    const cards = [
        { label: 'My Products', value: data.stats.totalProducts, icon: Package, color: 'from-blue-600 to-cyan-600' },
        { label: 'Orders Containing My Products', value: data.stats.totalOrders, icon: ShoppingCart, color: 'from-violet-600 to-blue-600' },
        { label: 'Estimated Revenue', value: formatPrice(data.stats.estimatedRevenue), icon: TrendingUp, color: 'from-green-600 to-emerald-600' },
    ];

    return (
        <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-blue-400 mb-2">Seller Dashboard</motion.h1>
            <p className="text-white/40 mb-8 text-sm">Manage your products and track your performance.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                {cards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                            <card.icon size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-extrabold text-white">{card.value}</p>
                        <p className="text-white/40 text-sm mt-1">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6 text-center">
                <Package size={40} className="text-blue-400/40 mx-auto mb-3" />
                <p className="text-white/50 mb-4 text-sm">Add products to start selling on our platform</p>
                <Link href="/seller/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition">
                    <Package size={15} /> Manage My Products
                </Link>
            </motion.div>
        </div>
    );
}
