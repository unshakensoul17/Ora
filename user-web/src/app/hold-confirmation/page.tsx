'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

function HoldDetails() {
    const searchParams = useSearchParams();
    const itemId = searchParams.get('itemId') || '1';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // QR code data (in production, this would come from API)
    const qrHash = 'fc' + Math.random().toString(36).substring(2, 10);

    // 4-hour countdown
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Demo item
    const item = {
        name: 'Royal Red Bridal Lehenga',
        locality: 'Vijay Nagar',
        address: '45, Scheme No. 54, Vijay Nagar, Indore',
    };

    return (
        <div className="max-w-lg mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✓</span>
            </div>

            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent mb-2">
                Hold Confirmed!
            </h1>
            <p className="text-neutral-600 mb-8">
                Show this QR code at the boutique to verify your hold.
            </p>

            {/* Countdown Timer */}
            <div className="glass-card p-4 rounded-xl mb-8">
                <p className="text-neutral-600 text-sm mb-2">Hold expires in</p>
                <p className="text-4xl font-bold text-accent font-mono">{formatTime(timeLeft)}</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-2xl mb-8">
                <div className="w-48 h-48 mx-auto bg-gray-900 rounded-xl flex items-center justify-center relative">
                    {/* Simulated QR pattern */}
                    <div className="absolute inset-4 grid grid-cols-8 gap-0.5">
                        {Array.from({ length: 64 }).map((_, i) => (
                            <div
                                key={i}
                                className={`aspect-square ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'} rounded-sm`}
                            />
                        ))}
                    </div>
                    <div className="relative z-10 text-accent text-xs font-mono">
                        {qrHash.toUpperCase()}
                    </div>
                </div>
                <p className="text-gray-600 text-sm mt-4">Booking ID: {qrHash.toUpperCase()}</p>
            </div>

            {/* Booking Details */}
            <div className="glass-card p-6 rounded-xl text-left mb-8">
                <h3 className="text-accent font-semibold mb-4">Booking Details</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Item</span>
                        <span className="text-neutral-900">{item.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Dates</span>
                        <span className="text-neutral-900">{formatDate(startDate)} - {formatDate(endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Boutique Area</span>
                        <span className="text-neutral-900">{item.locality}</span>
                    </div>
                </div>
            </div>

            {/* Shop Location */}
            <div className="glass-card p-6 rounded-xl text-left mb-8">
                <h3 className="text-accent font-semibold mb-4">📍 Boutique Location</h3>
                <p className="text-neutral-900 mb-4">{item.address}</p>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent hover:underline"
                >
                    Open in Google Maps →
                </a>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <Link
                    href="/my-holds"
                    className="block w-full py-4 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-xl shadow-pink-md hover:shadow-pink-lg hover:scale-[1.02] transition-all"
                >
                    View My Holds
                </Link>
                <Link
                    href="/"
                    className="block w-full py-4 border border-accent/30 text-accent font-semibold rounded-xl hover:bg-accent/10"
                >
                    Continue Browsing
                </Link>
            </div>
        </div>
    );
}

export default function HoldConfirmationPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-primary to-white pb-safe pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white/60 backdrop-blur-md py-4 px-6 border-b border-accent-muted/20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="font-heading text-2xl font-bold text-accent">ORA</Link>
                </div>
            </header>

            <section className="py-12 px-6">
                <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
                    <HoldDetails />
                </Suspense>
            </section>

            <Footer />
        </main>
    );
}
