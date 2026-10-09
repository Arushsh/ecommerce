'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, MapPin, User } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { Address } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Delhi',
    'Puducherry', 'Ladakh', 'Jammu and Kashmir',
];

const addressSchema = z.object({
    name: z.string().min(2, 'Name too short'),
    locality: z.string().min(3, 'Locality required'),
    city: z.string().min(2, 'City required'),
    mobile: z.string().regex(/^\d{10}$/, '10-digit mobile required'),
    zipcode: z.string().regex(/^\d{6}$/, '6-digit zipcode required'),
    state: z.string().min(1, 'Select a state'),
});
type AddressForm = z.infer<typeof addressSchema>;

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editing, setEditing] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddressForm>({
        resolver: zodResolver(addressSchema),
    });

    const fetchAddresses = () =>
        api.get('/customer').then(({ data }) => setAddresses(data.addresses));

    useEffect(() => { fetchAddresses(); }, []);

    const onSubmit = async (data: AddressForm) => {
        try {
            if (editing) {
                await api.put(`/customer/${editing}`, data);
                toast.success('Address updated!');
            } else {
                await api.post('/customer', data);
                toast.success('Address added!');
            }
            reset();
            setEditing(null);
            setShowForm(false);
            fetchAddresses();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save');
        }
    };

    const handleEdit = (addr: Address) => {
        reset(addr as any);
        setEditing(addr._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/customer/${id}`);
        toast.success('Address deleted');
        fetchAddresses();
    };

    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto px-4 py-8">
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold gradient-text mb-8">My Profile</motion.h1>

                {/* User Info */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                            <User size={24} className="text-violet-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{user?.username}</p>
                            <p className="text-white/40 text-sm">{user?.email}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 capitalize">{user?.role}</span>
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold flex items-center gap-2"><MapPin size={18} className="text-violet-400" /> Saved Addresses</h2>
                        <button onClick={() => { reset({}); setEditing(null); setShowForm(!showForm); }}
                            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition">
                            <Plus size={14} /> Add New
                        </button>
                    </div>

                    {/* Address Form */}
                    {showForm && (
                        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
                            {([
                                { name: 'name', label: 'Full Name', col: 2 },
                                { name: 'locality', label: 'Locality / Street' },
                                { name: 'city', label: 'City' },
                                { name: 'mobile', label: 'Mobile Number' },
                                { name: 'zipcode', label: 'ZIP Code' },
                            ] as any[]).map((f) => (
                                <div key={f.name} className={f.col === 2 ? 'md:col-span-2' : ''}>
                                    <label className="block text-xs text-white/50 mb-1">{f.label}</label>
                                    <input {...register(f.name)} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/60 transition" />
                                    {errors[f.name as keyof AddressForm] && (
                                        <p className="text-red-400 text-xs mt-1">{errors[f.name as keyof AddressForm]?.message as string}</p>
                                    )}
                                </div>
                            ))}
                            <div className="md:col-span-2">
                                <label className="block text-xs text-white/50 mb-1">State</label>
                                <select {...register('state')} className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/60 transition">
                                    <option value="">Select state</option>
                                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
                            </div>
                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-60 transition">
                                    {isSubmitting ? 'Saving...' : editing ? 'Update Address' : 'Save Address'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); reset({}); setEditing(null); }}
                                    className="px-5 py-2.5 rounded-xl glass text-white/60 text-sm transition">Cancel</button>
                            </div>
                        </motion.form>
                    )}

                    {/* Address Cards */}
                    {addresses.length === 0 && !showForm ? (
                        <p className="text-white/30 text-sm text-center py-6">No addresses saved yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map((addr) => (
                                <div key={addr._id} className="flex items-start justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition">
                                    <div className="text-sm text-white/70 space-y-0.5">
                                        <p className="font-semibold text-white">{addr.name}</p>
                                        <p>{addr.locality}, {addr.city}</p>
                                        <p>{addr.state} — {addr.zipcode}</p>
                                        <p>📞 {addr.mobile}</p>
                                    </div>
                                    <div className="flex gap-2 ml-4 flex-shrink-0">
                                        <button onClick={() => handleEdit(addr)} className="p-2 rounded-lg text-violet-400 hover:bg-violet-500/10 transition"><Pencil size={14} /></button>
                                        <button onClick={() => handleDelete(addr._id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
