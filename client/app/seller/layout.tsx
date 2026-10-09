'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { LayoutDashboard, Package, LogOut, ChevronRight, Store } from 'lucide-react';

const NAV = [
    { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/seller/products', label: 'My Products', icon: Package },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, initialized, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (initialized && !isLoading && !['seller', 'admin'].includes(user?.role ?? '')) {
            router.replace('/');
        }
    }, [initialized, isLoading, user]);

    if (!initialized || isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!['seller', 'admin'].includes(user?.role ?? '')) return null;

    return (
        <div className="flex min-h-screen">
            <aside className="w-56 shrink-0 glass border-r border-white/10 flex flex-col py-6 px-3 fixed top-0 left-0 h-full z-40">
                <div className="px-3 mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <Store size={16} className="text-blue-400" />
                        <p className="text-xs uppercase tracking-widest text-white/30">Seller Panel</p>
                    </div>
                    <p className="font-bold text-lg text-blue-400">{user?.username}</p>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}>
                                <Icon size={17} /> {label}
                                {active && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {user?.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-violet-400 hover:bg-violet-500/10 transition mb-2">
                        <LayoutDashboard size={14} /> Go to Admin Panel
                    </Link>
                )}
                <button onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition">
                    <LogOut size={17} /> Logout
                </button>
            </aside>
            <main className="ml-56 flex-1 min-h-screen p-8">{children}</main>
        </div>
    );
}
