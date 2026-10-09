'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Store, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const ROLE_ICONS: Record<string, React.ReactNode> = {
    admin: <Shield size={13} className="text-violet-400" />,
    seller: <Store size={13} className="text-blue-400" />,
    user: <User size={13} className="text-white/40" />,
};
const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    seller: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    user: 'bg-white/10 text-white/50 border-white/10',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useAuthStore((s) => s.user);

    const fetchUsers = () =>
        api.get('/admin/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));

    useEffect(() => { fetchUsers(); }, []);

    const changeRole = async (id: string, role: string) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
            toast.success('Role updated');
        } catch { toast.error('Failed to update role'); }
    };

    const deleteUser = async (id: string) => {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
            toast.success('User deleted');
        } catch { toast.error('Failed to delete user'); }
    };

    return (
        <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold gradient-text mb-8">Users</motion.h1>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-white/10">
                        <tr className="text-white/40 text-xs uppercase tracking-wide">
                            <th className="text-left px-5 py-4">User</th>
                            <th className="text-left px-5 py-4">Email</th>
                            <th className="text-left px-5 py-4">Joined</th>
                            <th className="text-left px-5 py-4">Role</th>
                            <th className="text-left px-5 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10 text-white/30">Loading...</td></tr>
                        ) : users.map((u, i) => (
                            <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                className="border-b border-white/5 hover:bg-white/3 transition">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300">
                                            {u.username[0].toUpperCase()}
                                        </div>
                                        <span className="font-medium text-white">{u.username}</span>
                                        {u._id === currentUser?._id && <span className="text-xs text-violet-400">(you)</span>}
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-white/50">{u.email}</td>
                                <td className="px-5 py-3 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                <td className="px-5 py-3">
                                    <select value={u.role} disabled={u._id === currentUser?._id}
                                        onChange={(e) => changeRole(u._id, e.target.value)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border bg-transparent cursor-pointer outline-none disabled:cursor-not-allowed ${ROLE_COLORS[u.role]}`}>
                                        <option value="user" className="bg-[#0a0a0f] text-white">user</option>
                                        <option value="seller" className="bg-[#0a0a0f] text-white">seller</option>
                                        <option value="admin" className="bg-[#0a0a0f] text-white">admin</option>
                                    </select>
                                </td>
                                <td className="px-5 py-3">
                                    {u._id !== currentUser?._id && (
                                        <button onClick={() => deleteUser(u._id)}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
