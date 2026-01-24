'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-xl border-t border-white/10 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') && pathname === '/' ? 'text-accent' : 'text-gray-400'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                    href="/search"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/search') ? 'text-accent' : 'text-gray-400'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-[10px] font-medium">Search</span>
                </Link>

                <div className="relative -top-5">
                    <Link
                        href="/search"
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-accent to-accent-hover shadow-luxury-lg text-primary transform transition-transform hover:scale-105"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </Link>
                </div>

                <Link
                    href="/my-holds"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/my-holds') ? 'text-accent' : 'text-gray-400'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-[10px] font-medium">Holds</span>
                </Link>

                <Link
                    href={user ? "/profile" : "/login"}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/profile') || isActive('/login') ? 'text-accent' : 'text-gray-400'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[10px] font-medium">{user ? 'Profile' : 'Login'}</span>
                </Link>
            </div>
        </div>
    );
}
