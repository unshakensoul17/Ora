'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icon component for consistent sizing
const Icon = ({ children }: { children: React.ReactNode }) => (
    <span className="w-5 h-5 flex items-center justify-center">{children}</span>
);

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></Icon>,
    },
    {
        label: 'Shop Management',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></Icon>,
        children: [
            { label: 'All Shops', href: '/shops' },
            { label: 'Pending Approval', href: '/shops/pending' },
            { label: 'Active Shops', href: '/shops/active' },
            { label: 'Suspended', href: '/shops/suspended' },
        ],
    },
    {
        label: 'Inventory Intelligence',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg></Icon>,
        children: [
            { label: 'Overview', href: '/inventory' },
            { label: 'Low Stock Alerts', href: '/inventory/alerts' },
        ],
    },
    {
        label: 'Financials',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></Icon>,
        children: [
            { label: 'Revenue', href: '/billing' },
            { label: 'Leads Billing', href: '/leads' },
        ],
    },
    {
        label: 'Users',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></Icon>,
        href: '/users',
    },
    {
        label: 'Security',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></Icon>,
        href: '/security',
    },
    {
        label: 'Analytics',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></Icon>,
        href: '/analytics',
    },
    {
        label: 'System Settings',
        icon: <Icon><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></Icon>,
        href: '/settings',
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Shop Management']);

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0d1117] border-r border-gray-800 hidden md:flex flex-col z-40">
            {/* Logo */}
            <div className="h-14 flex items-center px-4 border-b border-gray-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
                        <span className="text-black font-bold text-xs">F</span>
                    </div>
                    <span className="font-semibold text-white text-sm">ORA</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 overflow-y-auto">
                {navigation.map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleExpand(item.label)}
                                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${expandedItems.includes(item.label) ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                                        }`}
                                >
                                    {item.icon}
                                    <span className="flex-1 text-left text-xs font-medium">{item.label}</span>
                                    <svg width="12" height="12" className={`transition-transform ${expandedItems.includes(item.label) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {expandedItems.includes(item.label) && (
                                    <div className="ml-9 border-l border-gray-700">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`block px-4 py-1.5 text-xs transition-colors ${pathname === child.href ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
                                                    }`}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href={item.href || '/'}
                                className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${isActive(item.href) ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                                    }`}
                            >
                                {item.icon}
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
