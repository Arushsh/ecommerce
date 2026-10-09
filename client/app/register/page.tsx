'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const schema = z.object({
    username: z.string().min(3, 'At least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const { fetchCart } = useCartStore();
    const [showPw, setShowPw] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            const res = await api.post('/auth/register', {
                username: data.username,
                email: data.email,
                password: data.password,
            });
            setUser(res.data.user);
            await fetchCart();
            toast.success('Account created successfully!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const fields: { name: keyof FormData; label: string; type?: string; placeholder: string }[] = [
        { name: 'username', label: 'Username', placeholder: 'Choose a username' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-3">✨</div>
                        <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
                        <p className="text-white/40 text-sm mt-1">Join Transformers today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <label className="block text-sm text-white/60 mb-1.5">{field.label}</label>
                                <div className="relative">
                                    <input
                                        {...register(field.name)}
                                        type={field.type === 'password' ? (showPw ? 'text' : 'password') : field.type || 'text'}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition text-sm"
                                    />
                                    {field.type === 'password' && (
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    )}
                                </div>
                                {errors[field.name] && (
                                    <p className="text-red-400 text-xs mt-1">{errors[field.name]?.message as string}</p>
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold transition active:scale-95 mt-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><UserPlus size={18} /> Create Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
