'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        router.push('/');
    };

    // Don't show navbar on auth pages
    if (pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password')) {
        return null;
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden md:block ${scrolled ? 'glass-panel shadow-pink-soft' : 'bg-white/30 backdrop-blur-sm'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-pink-soft">
                            <span className="text-white font-bold text-sm">O</span>
                        </div>
                        <span className="font-heading font-bold text-xl bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">ORA</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)} // Reusing dropdown state for mobile menu toggle simplicity
                            className="text-neutral-700 hover:text-accent p-2 transition-colors"
                        >
                            {dropdownOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition ${pathname === '/' ? 'text-accent font-semibold' : 'text-neutral-700 hover:text-accent'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/search"
                            className={`text-sm font-medium transition ${pathname?.startsWith('/search') ? 'text-accent font-semibold' : 'text-neutral-700 hover:text-accent'
                                }`}
                        >
                            Browse
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className={`text-sm font-medium transition ${pathname === '/how-it-works' ? 'text-accent font-semibold' : 'text-neutral-700 hover:text-accent'
                                }`}
                        >
                            How It Works
                        </Link>
                        {/* Pink Reserve Button */}
                        <Link
                            href="/search"
                            className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold text-sm rounded-xl shadow-pink-md hover:shadow-pink-lg transition-all hover:-translate-y-0.5"
                        >
                            Reserve Now
                        </Link>
                        {/* Premium My Holds Button */}
                        <Link
                            href="/my-holds"
                            className="flex items-center gap-2 px-4 py-2 bg-accent-muted/20 border border-accent-muted/40 text-accent-hover font-semibold text-sm rounded-xl hover:bg-accent-muted/30 hover:border-accent/50 transition-all hover:-translate-y-0.5 group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>My Holds</span>
                        </Link>
                    </div>

                    {/* User Menu (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                        ) : user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 group"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-accent-muted to-accent rounded-full flex items-center justify-center border-2 border-transparent group-hover:border-accent group-hover:shadow-pink-soft transition-all">
                                        <span className="text-white font-semibold">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block text-neutral-700 text-sm font-medium max-w-[120px] truncate">
                                        {user.name}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-neutral-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Desktop Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl overflow-hidden animate-slide-down shadow-pink-lg">
                                        <div className="p-4 border-b border-accent-muted/20 bg-gradient-to-r from-accent-muted/10 to-accent/5">
                                            <p className="text-neutral-900 font-semibold truncate">{user.name}</p>
                                            <p className="text-neutral-500 text-xs truncate mt-1">{user.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link
                                                href="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-accent/10 hover:text-accent transition-all"
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/my-holds"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-accent/10 hover:text-accent transition-all"
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
                                                My Holds
                                            </Link>
                                        </div>
                                        <div className="border-t border-accent-muted/20 py-2">
                                            <Link
                                                href="/my-orders"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-accent/10 hover:text-accent transition-all"
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M12 16h.01" />
                                                </svg>
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-accent transition"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-accent to-accent-hover text-white rounded-xl shadow-pink-md hover:shadow-pink-lg transition-all hover:-translate-y-0.5"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {dropdownOpen && (
                    <div className="md:hidden glass-panel border-t border-accent-muted/20 animate-slide-down shadow-pink-md">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <Link
                                href="/"
                                onClick={() => setDropdownOpen(false)}
                                className={`block px-3 py-2 rounded-xl text-base font-medium ${pathname === '/' ? 'text-accent bg-accent/10 font-semibold' : 'text-neutral-700 hover:text-accent hover:bg-accent/5'
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                href="/search"
                                onClick={() => setDropdownOpen(false)}
                                className={`block px-3 py-2 rounded-xl text-base font-medium ${pathname?.startsWith('/search') ? 'text-accent bg-accent/10 font-semibold' : 'text-neutral-700 hover:text-accent hover:bg-accent/5'
                                    }`}
                            >
                                Browse
                            </Link>
                            <Link
                                href="/#how-it-works"
                                onClick={() => setDropdownOpen(false)}
                                className={`block px-3 py-2 rounded-xl text-base font-medium ${pathname === '/how-it-works' ? 'text-accent bg-accent/10 font-semibold' : 'text-neutral-700 hover:text-accent hover:bg-accent/5'
                                    }`}
                            >
                                How It Works
                            </Link>

                            {/* User Section in Mobile Menu */}
                            <div className="mt-4 pt-4 border-t border-accent-muted/20">
                                {loading ? (
                                    <div className="animate-pulse h-10 bg-gray-700 rounded w-full" />
                                ) : user ? (
                                    <>
                                        <div className="flex items-center px-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-muted to-accent flex items-center justify-center text-white mr-3 shadow-pink-soft">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-base font-semibold text-neutral-900">{user.name}</div>
                                                <div className="text-sm text-neutral-500">{user.email}</div>
                                            </div>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-3 py-2 rounded-xl text-base font-medium text-neutral-700 hover:text-accent hover:bg-accent/10"
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/my-holds"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-3 py-2 rounded-xl text-base font-medium text-neutral-700 hover:text-accent hover:bg-accent/10"
                                        >
                                            My Holds
                                        </Link>
                                        <Link
                                            href="/my-orders"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-3 py-2 rounded-xl text-base font-medium text-neutral-700 hover:text-accent hover:bg-accent/10"
                                        >
                                            My Orders
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-2 mt-2">
                                        <Link
                                            href="/login"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block w-full text-center px-4 py-2.5 border border-accent-muted/30 rounded-xl text-neutral-700 font-medium hover:bg-accent/5 hover:border-accent/40"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-white rounded-xl font-semibold shadow-pink-md"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add dropdown animation */}
            <style jsx>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.2s ease-out;
                }
            `}</style>
        </nav>
    );
}
