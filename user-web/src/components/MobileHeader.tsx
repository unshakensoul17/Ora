'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function MobileHeader() {
    const { user } = useAuth();

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 bg-charcoal/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 transition-all duration-300">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                    <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="font-heading font-bold text-lg text-white tracking-wide">ORA</span>
            </Link>

            {/* Optional: Add a small action like 'How it works' or User icon if needed, 
                but User icon is already in bottom nav. 
                Let's keep it clean or add a 'Help' link? 
                Actually, maybe just the logo is enough for simplicity, 
                or a nice subtle 'Indore' location badge. */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                    <span className="text-xs text-gray-400">📍 Indore</span>
                </div>
            </div>
        </header>
    );
}
