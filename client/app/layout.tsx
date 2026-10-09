import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Transformers — Premium Dairy Products',
  description: 'Shop the finest dairy products: Milk, Curd, Paneer, Ghee, Cheese, Ice Cream and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0f] text-white min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(10,10,15,0.95)',
                color: '#f0f0ff',
                border: '1px solid rgba(167,139,250,0.3)',
                backdropFilter: 'blur(16px)',
              },
              success: { iconTheme: { primary: '#34d399', secondary: '#0a0a0f' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#0a0a0f' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
