'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingCart, Users, LogOut, ChevronRight,
} from 'lucide-react';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, initialized, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (initialized && !isLoading && user?.role !== 'admin') {
            router.replace('/');
        }
    }, [initialized, isLoading, user]);

    if (!initialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (user?.role !== 'admin') return null;

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 glass border-r border-white/10 flex flex-col py-6 px-3 fixed top-0 left-0 h-full z-40">
                <div className="px-3 mb-8">
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Admin Panel</p>
                    <p className="font-bold gradient-text text-lg">Transformers</p>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}>
                                <Icon size={17} />
                                {label}
                                {active && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <button onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition mt-auto">
                    <LogOut size={17} /> Logout
                </button>
            </aside>

            {/* Main */}
            <main className="ml-56 flex-1 min-h-screen p-8">
                {children}
            </main>
        </div>
    );
}
