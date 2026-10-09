'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Search, Menu, X, User, LogOut, Package, Shield, Store } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { cart } = useCartStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const cartCount = cart?.items?.length ?? 0;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
    ];

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                    <span className="text-xl font-bold gradient-text">🥛 Transformers</span>
                </Link>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search dairy products..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 focus:bg-white/10 transition"
                        />
                    </div>
                </form>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm transition',
                                pathname === link.href
                                    ? 'bg-violet-500/20 text-violet-300'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right icons */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <Link href="/wishlist" className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition">
                                <Heart size={20} />
                            </Link>
                            <Link href="/cart" className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </Link>
                            <Link href="/orders" className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition hidden md:block">
                                <Package size={20} />
                            </Link>
                            {user?.role === 'admin' && (
                                <Link href="/admin" title="Admin Panel"
                                    className="p-2 rounded-xl text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition hidden md:block">
                                    <Shield size={20} />
                                </Link>
                            )}
                            {(user?.role === 'seller' || user?.role === 'admin') && (
                                <Link href="/seller" title="Seller Panel"
                                    className="p-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition hidden md:block">
                                    <Store size={20} />
                                </Link>
                            )}
                            <Link href="/profile" className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition">
                                <User size={20} />
                            </Link>
                            <button
                                onClick={logout}
                                className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-white/10 px-4 pb-4"
                    >
                        <form onSubmit={handleSearch} className="mt-3 mb-2">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none"
                                />
                            </div>
                        </form>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block py-2 text-sm text-white/70 hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <>
                                <Link href="/orders" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-white/70 hover:text-white">Orders</Link>
                                <Link href="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-white/70 hover:text-white">Profile</Link>
                                {user?.role === 'admin' && (
                                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-violet-400 hover:text-violet-300">🛡 Admin Panel</Link>
                                )}
                                {['seller', 'admin'].includes(user?.role ?? '') && (
                                    <Link href="/seller" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-blue-400 hover:text-blue-300">🏪 Seller Panel</Link>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
