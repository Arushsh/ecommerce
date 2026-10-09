'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, initialized } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after fetchMe has actually completed at least once.
        // Without `initialized`, isLoading starts as false and user is null,
        // causing an instant redirect before the auth check even runs.
        if (initialized && !isLoading && !user) {
            router.replace('/login');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialized, isLoading, user]);

    // Show spinner until we know auth state
    if (!initialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // After initialized: if no user, show nothing (redirect in progress)
    if (!user) return null;

    return <>{children}</>;
}
