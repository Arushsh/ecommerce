'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
    Pending: 'text-yellow-400',
    Accepted: 'text-blue-400',
    Packed: 'text-indigo-400',
    'On the Way': 'text-cyan-400',
    Delivered: 'text-green-400',
    Cancel: 'text-red-400',
};

export default function AdminDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stats').then(({ data }) => setData(data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-24"><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

    const statCards = [
        { label: 'Total Revenue', value: formatPrice(data.stats.totalRevenue), icon: TrendingUp, color: 'from-violet-600 to-blue-600' },
        { label: 'Total Orders', value: data.stats.totalOrders, icon: ShoppingCart, color: 'from-blue-600 to-cyan-600' },
        { label: 'Total Products', value: data.stats.totalProducts, icon: Package, color: 'from-green-600 to-emerald-600' },
        { label: 'Total Users', value: data.stats.totalUsers, icon: Users, color: 'from-orange-600 to-amber-600' },
    ];

    return (
        <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold gradient-text mb-8">Overview</motion.h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {statCards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="glass rounded-2xl p-5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                            <card.icon size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-extrabold text-white">{card.value}</p>
                        <p className="text-white/40 text-sm mt-1">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6">
                    <h2 className="font-bold mb-5 text-white">Orders by Status</h2>
                    <div className="space-y-3">
                        {Object.entries(data.ordersByStatus).map(([status, count]: any) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${STATUS_COLORS[status] || 'text-white/60'}`}>{status}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div className="h-full bg-violet-500 rounded-full"
                                            style={{ width: `${Math.min((count / data.stats.totalOrders) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-white/60 text-sm w-4 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Orders */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6">
                    <h2 className="font-bold mb-5 text-white flex items-center gap-2"><Clock size={16} className="text-violet-400" /> Recent Orders</h2>
                    <div className="space-y-3">
                        {data.recentOrders.map((order: any) => (
                            <div key={order._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-white">#{order._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-xs text-white/40">{order.userId?.username || 'Unknown'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{formatPrice(order.totalAmount)}</p>
                                    <p className={`text-xs ${STATUS_COLORS[order.status] || 'text-white/40'}`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
