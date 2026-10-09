'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Plus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Address } from '@/types';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

declare global {
    interface Window { Razorpay: any; }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, fetchCart } = useCartStore();
    const user = useAuthStore((s) => s.user);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddr, setSelectedAddr] = useState('');
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        fetchCart();
        api.get('/customer').then(({ data }) => {
            setAddresses(data.addresses);
            if (data.addresses.length > 0) setSelectedAddr(data.addresses[0]._id);
        });
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const handlePayment = async () => {
        if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
        if (!cart || cart.items.length === 0) { toast.error('Cart is empty'); return; }
        setPaying(true);
        try {
            // 1. Create Razorpay order on backend
            const { data: orderData } = await api.post('/payment/create-order');

            // 2. Open Razorpay modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Transformers Dairy',
                description: 'Premium Dairy Products',
                order_id: orderData.orderId,
                handler: async (response: any) => {
                    try {
                        // 3. Verify payment on backend
                        await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            addressId: selectedAddr,
                        });
                        toast.success('Payment successful! 🎉 Order placed.');
                        router.push('/orders');
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                    }
                },
                prefill: { name: user?.username, email: user?.email },
                theme: { color: '#7c3aed' },
                modal: {
                    ondismiss: () => { setPaying(false); toast.error('Payment cancelled'); }
                },
            };
            new window.Razorpay(options).open();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
            setPaying(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold gradient-text mb-8">Checkout</motion.h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left — Address */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold flex items-center gap-2"><MapPin size={18} className="text-violet-400" /> Delivery Address</h2>
                                <a href="/profile" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition"><Plus size={13} /> Add New</a>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-6 text-white/40">
                                    <p>No addresses saved.</p>
                                    <a href="/profile" className="text-violet-400 text-sm hover:underline">Add an address →</a>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((addr) => (
                                        <label key={addr._id} className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition ${selectedAddr === addr._id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20'
                                            }`}>
                                            <input type="radio" name="address" value={addr._id}
                                                checked={selectedAddr === addr._id} onChange={() => setSelectedAddr(addr._id)}
                                                className="mt-1 accent-violet-500" />
                                            <div>
                                                <p className="font-semibold text-white">{addr.name}</p>
                                                <p className="text-sm text-white/50">{addr.locality}, {addr.city}, {addr.state} — {addr.zipcode}</p>
                                                <p className="text-sm text-white/50">📞 {addr.mobile}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="glass rounded-2xl p-6">
                            <h2 className="font-bold mb-4">Order Items</h2>
                            <div className="space-y-3">
                                {cart?.items.map((item) => (
                                    <div key={item._id} className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                            <Image src={item.productId.imageUrl} alt={item.productId.title} fill className="object-cover" sizes="48px" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{item.productId.title}</p>
                                            <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold">{formatPrice(item.quantity * item.productId.discountedPrice)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Summary */}
                    <div className="lg:col-span-1">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl p-6 sticky top-24">
                            <h2 className="font-bold mb-5">Payment Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-white/60">
                                    <span>Subtotal</span><span>{formatPrice(cart?.subtotal ?? 0)}</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Delivery</span><span>{formatPrice(cart?.delivery ?? 0)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-base">
                                    <span>Total</span>
                                    <span className="gradient-text">{formatPrice(cart?.total ?? 0)}</span>
                                </div>
                            </div>

                            <button onClick={handlePayment} disabled={paying || !selectedAddr}
                                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold transition active:scale-95">
                                {paying
                                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <><CreditCard size={18} /> Pay {formatPrice(cart?.total ?? 0)}</>
                                }
                            </button>
                            <p className="text-center text-white/30 text-xs mt-3">🔒 Secured by Razorpay</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
