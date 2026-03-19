'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Phone, WhatsApp } from '@/components/ui/Icons';

interface StickyBottomBarProps {
    phoneNumber?: string;
}

export function StickyBottomBar({ phoneNumber = '919876543210' }: StickyBottomBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past hero section
            setIsVisible(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Hi, I want to rent an outfit!')}`;

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-t border-accent/10" />

            {/* Content */}
            <div className="relative px-4 py-3 safe-area-bottom">
                <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
                    {/* Reserve Now - Primary */}
                    <Link
                        href="/search"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-xl text-sm shadow-luxury"
                    >
                        <Search size={18} />
                        Reserve Now
                    </Link>

                    {/* WhatsApp */}
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl shadow-luxury"
                        aria-label="WhatsApp"
                    >
                        <WhatsApp size={22} className="text-white" />
                    </a>

                    {/* Call */}
                    <a
                        href={`tel:+${phoneNumber}`}
                        className="flex items-center justify-center w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl"
                        aria-label="Call Boutique"
                    >
                        <Phone size={20} className="text-accent" />
                    </a>
                </div>
            </div>
        </div>
    );
}
