'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserHolds, cancelHold, type BookingHold } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';

export default function MyHoldsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [holds, setHolds] = useState<BookingHold[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [selectedShop, setSelectedShop] = useState<any>(null);
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?returnTo=/my-holds');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadHolds();
        }
    }, [user]);

    async function loadHolds() {
        if (!user) return;

        try {
            setLoading(true);
            setError('');
            const backendHolds = await getUserHolds(user.id);
            setHolds(backendHolds);
        } catch (error) {
            console.error('Failed to load holds:', error);
            setError('Failed to load your reservations. Please try again.');
            setHolds([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(holdId: string) {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        try {
            setCancelingId(holdId);
            await cancelHold(holdId);
            await loadHolds();
        } catch (error: any) {
            console.error('Failed to cancel hold:', error);
            alert('Failed to cancel reservation. Please try again.');
        } finally {
            setCancelingId(null);
        }
    }

    function getTimeRemaining(expiresAt: string) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    }

    function getStatusColor(status: string) {
        const colors = {
            HOLD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
            CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
            COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
        return colors[status as keyof typeof colors] || colors.HOLD;
    }

    const getImageUrl = (item: any) => {
        if (!item?.images || item.images.length === 0) return '';
        const imagePath = item.images[0];
        if (imagePath.startsWith('http')) return imagePath;
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/inventory-images/${imagePath}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary to-white pt-20 pb-safe pb-20 md:pb-0">
            {/* Breadcrumb Navigation */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-accent-muted/20">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-neutral-600 hover:text-accent transition-colors">
                            Home
                        </Link>
                        <span className="text-neutral-400">›</span>
                        <span className="text-neutral-900 font-semibold">My Reservations</span>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent font-heading mb-2">My Reservations</h1>
                <p className="text-neutral-600 mb-8">Manage your outfit holds and reservations</p>

                {loading ? (
                    <div className="text-center py-12 text-neutral-600">Loading your holds...</div>
                ) : error ? (
                    <div className="glass-card border border-red-400/30 rounded-xl p-12 text-center">
                        <div className="text-red-400 text-xl mb-4">{error}</div>
                        <button
                            onClick={loadHolds}
                            className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-hover transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : holds.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">👗</div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Reservations Yet</h2>
                        <p className="text-neutral-600 mb-6">
                            Start browsing to find your perfect outfit!
                        </p>
                        <Link
                            href="/search"
                            className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-hover transition"
                        >
                            Browse Outfits
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {holds.map((hold) => {
                            const item = hold.inventoryItem || hold.item;
                            const imageUrl = getImageUrl(item);

                            return (
                                <div
                                    key={hold.id}
                                    className="glass-card rounded-xl p-6 hover:border-accent/40 transition"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Item Image */}
                                        <div className="w-full sm:w-48 aspect-[3/4] sm:h-64 rounded-lg flex-shrink-0 overflow-hidden bg-neutral-100">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item?.name || 'Item'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-end p-4">
                                                    <span className="text-neutral-700 font-medium text-sm">
                                                        {item?.name || 'Item'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hold Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                                                        {item?.name || 'Outfit'}
                                                    </h3>
                                                    <p className="text-neutral-600">
                                                        {item?.shop?.locality || 'Indore'}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(hold.status)}`}>
                                                    {hold.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-neutral-500 text-sm">Pickup Date</p>
                                                    <p className="text-neutral-900 font-semibold">
                                                        {hold.startDate ? new Date(hold.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-neutral-500 text-sm">Return Date</p>
                                                    <p className="text-neutral-900 font-semibold">
                                                        {hold.endDate ? new Date(hold.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date'}
                                                    </p>
                                                </div>
                                            </div>

                                            {hold.status === 'HOLD' && hold.holdExpiresAt && (
                                                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                                    <p className="text-amber-400 text-sm font-medium">
                                                        ⏰ {getTimeRemaining(hold.holdExpiresAt)}
                                                    </p>
                                                    <p className="text-gray-400 text-xs mt-1">
                                                        Visit the shop before your hold expires
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mb-4 p-4 bg-white/60 rounded-lg">
                                                <p className="text-neutral-600 text-sm mb-2">Your QR Code</p>
                                                <div className="bg-white p-3 rounded-lg inline-block">
                                                    <QRCodeSVG
                                                        value={`ora://booking/${hold.id}?hash=${hold.qrCodeHash}`}
                                                        size={120}
                                                        level="M"
                                                    />
                                                </div>
                                                <p className="text-gray-500 text-xs mt-2">
                                                    Show this QR code at the shop
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        const shop = item?.shop;
                                                        if (shop) {
                                                            setSelectedShop(shop);
                                                            setShowLocationModal(true);
                                                        } else {
                                                            alert('Shop information not available');
                                                        }
                                                    }}
                                                    className="px-6 py-2 bg-accent/15 border border-accent/40 text-accent rounded-lg font-medium hover:bg-accent/25 hover:border-accent/60 transition"
                                                >
                                                    📍 View Location
                                                </button>
                                                {hold.status === 'HOLD' && (
                                                    <button
                                                        onClick={() => handleCancel(hold.id)}
                                                        disabled={cancelingId === hold.id}
                                                        className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition disabled:opacity-50"
                                                    >
                                                        {cancelingId === hold.id ? 'Canceling...' : 'Cancel Hold'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Location Modal */}
            {showLocationModal && selectedShop && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLocationModal(false)}>
                    <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-accent-muted/30" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-1">{selectedShop.name}</h3>
                                <p className="text-neutral-600 text-sm">Shop Location & Contact</p>
                            </div>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="text-neutral-600 hover:text-neutral-900 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Address */}
                        <div className="mb-6 p-4 bg-gray-900 rounded-lg">
                            <p className="text-gray-400 text-sm mb-2">📍 Address</p>
                            <p className="text-white font-medium">
                                {selectedShop.address || `${selectedShop.locality}, Indore`}
                            </p>
                            {selectedShop.locality && (
                                <p className="text-gray-400 text-sm mt-1">{selectedShop.locality}</p>
                            )}
                        </div>

                        {/* Navigation Options */}
                        <div className="space-y-3 mb-6">
                            <p className="text-gray-400 text-sm font-medium mb-3">Navigate with:</p>

                            {/* Google Maps */}
                            <button
                                onClick={() => {
                                    if (selectedShop.lat && selectedShop.lng) {
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedShop.lat},${selectedShop.lng}`, '_blank');
                                    } else {
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedShop.address || selectedShop.name)}`, '_blank');
                                    }
                                }}
                                className="w-full flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition"
                            >
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xl">🗺️</span>
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-white font-medium">Google Maps</p>
                                    <p className="text-gray-400 text-xs">Get directions</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Apple Maps (for iOS/Mac users) */}
                            <button
                                onClick={() => {
                                    if (selectedShop.lat && selectedShop.lng) {
                                        window.open(`maps://maps.apple.com/?daddr=${selectedShop.lat},${selectedShop.lng}`, '_blank');
                                    }
                                }}
                                className="w-full flex items-center gap-3 p-4 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                            >
                                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xl">🍎</span>
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-white font-medium">Apple Maps</p>
                                    <p className="text-gray-400 text-xs">iOS/Mac only</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Copy Address */}
                            <button
                                onClick={() => {
                                    const address = selectedShop.address || `${selectedShop.name}, ${selectedShop.locality}, Indore`;
                                    navigator.clipboard.writeText(address);
                                    alert('Address copied to clipboard!');
                                }}
                                className="w-full flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition"
                            >
                                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xl">📋</span>
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-white font-medium">Copy Address</p>
                                    <p className="text-gray-400 text-xs">To clipboard</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Coordinates (for reference) */}
                        {selectedShop.lat && selectedShop.lng && (
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                <p className="text-gray-500 text-xs mb-1">Coordinates</p>
                                <p className="text-gray-400 text-sm font-mono">
                                    {selectedShop.lat.toFixed(6)}, {selectedShop.lng.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
