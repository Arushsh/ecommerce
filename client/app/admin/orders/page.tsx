'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Accepted', 'Packed', 'On the Way', 'Delivered', 'Cancel'];
const STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Accepted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Packed: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'On the Way': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
    Cancel: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () =>
        api.get('/admin/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));

    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
            toast.success('Status updated');
        } catch { toast.error('Failed to update'); }
    };

    return (
        <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold gradient-text mb-8">Orders</motion.h1>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-white/10">
                        <tr className="text-white/40 text-xs uppercase tracking-wide">
                            <th className="text-left px-5 py-4">Order ID</th>
                            <th className="text-left px-5 py-4">Customer</th>
                            <th className="text-left px-5 py-4">Items</th>
                            <th className="text-left px-5 py-4">Total</th>
                            <th className="text-left px-5 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10 text-white/30">Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-10 text-white/30">No orders yet</td></tr>
                        ) : orders.map((order, i) => (
                            <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                className="border-b border-white/5 hover:bg-white/3 transition">
                                <td className="px-5 py-3 font-mono text-white/60">#{order._id.slice(-8).toUpperCase()}</td>
                                <td className="px-5 py-3">
                                    <p className="text-white font-medium">{order.userId?.username || 'Unknown'}</p>
                                    <p className="text-white/40 text-xs">{order.userId?.email}</p>
                                </td>
                                <td className="px-5 py-3 text-white/60">{order.items?.length || 0} items</td>
                                <td className="px-5 py-3 font-semibold">{formatPrice(order.totalAmount)}</td>
                                <td className="px-5 py-3">
                                    <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border bg-transparent cursor-pointer outline-none ${STATUS_COLORS[order.status] || 'bg-white/10 text-white/60 border-white/20'}`}>
                                        {STATUSES.map((s) => <option key={s} value={s} className="bg-[#0a0a0f] text-white">{s}</option>)}
                                    </select>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
