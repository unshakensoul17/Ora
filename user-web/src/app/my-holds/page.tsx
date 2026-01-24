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
        loadHolds();
    }, []);

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
        <div className="min-h-screen bg-charcoal pt-20 pb-safe pb-20 md:pb-0">
            {/* Breadcrumb Navigation */}
            <div className="bg-charcoal-light border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-400 hover:text-accent transition-colors">
                            Home
                        </Link>
                        <span className="text-gray-600">›</span>
                        <span className="text-white font-medium">My Reservations</span>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-white font-heading mb-2">My Reservations</h1>
                <p className="text-gray-400 mb-8">Manage your outfit holds and reservations</p>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading your holds...</div>
                ) : error ? (
                    <div className="bg-charcoal-lighter border border-red-500/30 rounded-xl p-12 text-center">
                        <div className="text-red-400 text-xl mb-4">{error}</div>
                        <button
                            onClick={loadHolds}
                            className="inline-block bg-accent text-primary px-8 py-3 rounded-lg font-semibold hover:bg-accent-hover transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : holds.length === 0 ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">👗</div>
                        <h2 className="text-2xl font-bold text-white mb-2">No Reservations Yet</h2>
                        <p className="text-gray-400 mb-6">
                            Start browsing to find your perfect outfit!
                        </p>
                        <Link
                            href="/search"
                            className="inline-block bg-amber-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 transition"
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
                                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-amber-500/30 transition"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Item Image */}
                                        <div className="w-full sm:w-48 h-64 rounded-lg flex-shrink-0 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item?.name || 'Item'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-end p-4">
                                                    <span className="text-white/80 font-medium text-sm">
                                                        {item?.name || 'Item'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hold Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-1">
                                                        {item?.name || 'Outfit'}
                                                    </h3>
                                                    <p className="text-gray-400">
                                                        {item?.shop?.locality || 'Indore'}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(hold.status)}`}>
                                                    {hold.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-gray-500 text-sm">Pickup Date</p>
                                                    <p className="text-white font-medium">
                                                        {hold.startDate ? new Date(hold.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Return Date</p>
                                                    <p className="text-white font-medium">
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

                                            <div className="mb-4 p-4 bg-gray-900 rounded-lg">
                                                <p className="text-gray-400 text-sm mb-2">Your QR Code</p>
                                                <div className="bg-white p-3 rounded-lg inline-block">
                                                    <QRCodeSVG
                                                        value={`fashcycle://booking/${hold.id}?hash=${hold.qrCodeHash}`}
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
                                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
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
                    <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">{selectedShop.name}</h3>
                                <p className="text-gray-400 text-sm">Shop Location & Contact</p>
                            </div>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="text-gray-400 hover:text-white transition"
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
