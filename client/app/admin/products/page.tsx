'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, CATEGORIES } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
    title: z.string().min(2),
    sellingPrice: z.coerce.number().min(0),
    discountedPrice: z.coerce.number().min(0),
    description: z.string().min(5),
    composition: z.string().optional(),
    prodapp: z.string().optional(),
    category: z.string().min(1, 'Select a category'),
});
type FormData = z.infer<typeof schema>;

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const fetchProducts = () =>
        api.get('/admin/products').then(({ data }) => setProducts(data.products)).finally(() => setLoading(false));

    useEffect(() => { fetchProducts(); }, []);

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
    };

    const onSubmit = async (data: FormData) => {
        if (!editing && !imageFile) { toast.error('Image is required'); return; }
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => v != null && fd.append(k, String(v)));
        if (imageFile) fd.append('image', imageFile);
        try {
            if (editing) {
                await api.put(`/admin/products/${editing._id}`, fd);
                toast.success('Product updated!');
            } else {
                await api.post('/admin/products', fd);
                toast.success('Product added!');
            }
            reset(); setEditing(null); setImageFile(null); setImagePreview(''); setShowForm(false);
            fetchProducts();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleEdit = (p: Product) => {
        setEditing(p);
        reset({
            title: p.title, sellingPrice: p.sellingPrice, discountedPrice: p.discountedPrice,
            description: p.description, composition: p.composition, prodapp: p.prodapp, category: p.category
        });
        setImagePreview(p.imageUrl);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        await api.delete(`/admin/products/${id}`);
        toast.success('Deleted');
        fetchProducts();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold gradient-text">Products</motion.h1>
                <button onClick={() => { reset({}); setEditing(null); setImagePreview(''); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="glass rounded-3xl p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">{editing ? 'Edit Product' : 'Add Product'}</h2>
                                <button onClick={() => { setShowForm(false); setEditing(null); }}
                                    className="p-2 rounded-xl hover:bg-white/10 transition"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                                {/* Image */}
                                <div className="col-span-2">
                                    <div onClick={() => fileRef.current?.click()}
                                        className="w-full h-36 rounded-2xl border-2 border-dashed border-white/20 hover:border-violet-500/50 flex flex-col items-center justify-center cursor-pointer transition overflow-hidden relative">
                                        {imagePreview ? (
                                            <Image src={imagePreview} alt="preview" fill className="object-cover rounded-2xl" />
                                        ) : (
                                            <><Upload size={24} className="text-white/30 mb-2" /><p className="text-white/30 text-sm">Click to upload image</p></>
                                        )}
                                    </div>
                                    <input ref={fileRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
                                </div>

                                {[
                                    { name: 'title', label: 'Title', col: 2 },
                                    { name: 'sellingPrice', label: 'Selling Price', type: 'number' },
                                    { name: 'discountedPrice', label: 'Discounted Price', type: 'number' },
                                    { name: 'description', label: 'Description', col: 2, textarea: true },
                                    { name: 'composition', label: 'Composition', col: 2, textarea: true },
                                    { name: 'prodapp', label: 'Applications', col: 2, textarea: true },
                                ].map((f: any) => (
                                    <div key={f.name} className={f.col === 2 ? 'col-span-2' : ''}>
                                        <label className="block text-xs text-white/50 mb-1">{f.label}</label>
                                        {f.textarea ? (
                                            <textarea {...register(f.name)} rows={2}
                                                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/60 transition resize-none" />
                                        ) : (
                                            <input {...register(f.name)} type={f.type || 'text'}
                                                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/60 transition" />
                                        )}
                                        {errors[f.name as keyof FormData] && <p className="text-red-400 text-xs mt-1">{String(errors[f.name as keyof FormData]?.message)}</p>}
                                    </div>
                                ))}

                                <div className="col-span-2">
                                    <label className="block text-xs text-white/50 mb-1">Category</label>
                                    <select {...register('category')} className="w-full px-3 py-2 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/60 transition">
                                        <option value="">Select category</option>
                                        {CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                                    </select>
                                    {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                                </div>

                                <div className="col-span-2 flex gap-3 mt-2">
                                    <button type="submit" disabled={isSubmitting}
                                        className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold transition">
                                        {isSubmitting ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                                    </button>
                                    <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                                        className="px-6 py-3 rounded-xl glass text-white/60 transition">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Product Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-white/10">
                        <tr className="text-white/40 text-xs uppercase tracking-wide">
                            <th className="text-left px-5 py-4">Product</th>
                            <th className="text-left px-5 py-4">Category</th>
                            <th className="text-left px-5 py-4">Price</th>
                            <th className="text-left px-5 py-4">Stock</th>
                            <th className="text-left px-5 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10 text-white/30">Loading...</td></tr>
                        ) : products.map((p) => (
                            <tr key={p._id} className="border-b border-white/5 hover:bg-white/3 transition">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                            <Image src={p.imageUrl} alt={p.title} fill className="object-cover" sizes="40px" />
                                        </div>
                                        <span className="font-medium text-white truncate max-w-[180px]">{p.title}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-white/50">{p.categoryLabel || p.category}</td>
                                <td className="px-5 py-3">
                                    <div><span className="font-semibold">{formatPrice(p.discountedPrice)}</span>
                                        <span className="text-white/30 line-through ml-2 text-xs">{formatPrice(p.sellingPrice)}</span></div>
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition"><Pencil size={14} /></button>
                                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
