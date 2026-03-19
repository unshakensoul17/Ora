'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserHolds, cancelHold, type BookingHold } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Navigation, Copy, ExternalLink, ChevronRight, Phone, Clock, Sparkles } from '@/components/ui/Icons';

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
                    <div className="glass-card rounded-2xl p-16 text-center shadow-pink-soft border-accent/10">
                        <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                            <Sparkles size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2 font-heading">No Reservations Yet</h2>
                        <p className="text-neutral-600 mb-8 max-w-sm mx-auto">
                            Your wardrobe is waiting for its next star! Start browsing to hold your favorite outfits.
                        </p>
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-accent-hover text-white px-10 py-4 rounded-2xl font-bold shadow-pink-md hover:shadow-pink-lg hover:-translate-y-0.5 transition-all"
                        >
                            Browse Collection
                            <ChevronRight size={20} />
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
                                                <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                    <div className="flex items-center gap-2 text-amber-700 text-sm font-bold uppercase tracking-wider mb-1">
                                                        <Clock size={16} />
                                                        {getTimeRemaining(hold.holdExpiresAt as string)}
                                                    </div>
                                                    <p className="text-amber-600/80 text-xs text-pretty">
                                                        Visit the boutique before this hold releases to others
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

                                            <div className="flex flex-wrap gap-3">
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
                                                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-accent/20 text-accent rounded-xl font-bold hover:bg-accent hover:text-white hover:border-transparent transition-all shadow-sm active:scale-95"
                                                >
                                                    <MapPin size={18} />
                                                    View Location
                                                </button>
                                                {hold.status === 'HOLD' && (
                                                    <button
                                                        onClick={() => handleCancel(hold.id)}
                                                        disabled={cancelingId === hold.id}
                                                        className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300" onClick={() => setShowLocationModal(false)}>
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/20 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        {/* Header with Background Gradient */}
                        <div className="relative h-24 bg-gradient-to-r from-accent/20 via-primary to-accent/10 flex items-end px-8 pb-4">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-neutral-600 hover:bg-white hover:text-accent transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-neutral-900 leading-tight">{selectedShop.name}</h3>
                        </div>

                        <div className="p-8">
                            {/* Address Card */}
                            <div className="mb-8 p-5 bg-gradient-to-br from-white to-primary/30 rounded-2xl border border-accent-muted/20 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MapPin size={48} className="text-accent" />
                                </div>
                                <p className="text-accent text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                                    <MapPin size={12} />
                                    Pickup Point
                                </p>
                                <p className="text-neutral-800 font-semibold text-lg leading-relaxed relative z-10">
                                    {selectedShop.address || `${selectedShop.locality}, Indore`}
                                </p>
                                {selectedShop.locality && (
                                    <p className="text-neutral-500 text-sm mt-1">{selectedShop.locality}</p>
                                )}
                            </div>

                            {/* Navigation Options */}
                            <div className="space-y-4 mb-8">
                                <p className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold mb-4">Navigate to Shop</p>

                                {/* Google Maps */}
                                <button
                                    onClick={() => {
                                        if (selectedShop.lat && selectedShop.lng) {
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedShop.lat},${selectedShop.lng}`, '_blank');
                                        } else {
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedShop.address || selectedShop.name)}`, '_blank');
                                        }
                                    }}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl hover:border-accent/40 hover:shadow-pink-soft transition-all group"
                                >
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Navigation size={22} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-neutral-900 font-bold">Google Maps</p>
                                        <p className="text-neutral-500 text-xs">Fastest route to boutique</p>
                                    </div>
                                    <ExternalLink size={18} className="text-neutral-300 group-hover:text-accent transition-colors" />
                                </button>

                                {/* Apple Maps (iOS specialized feel) */}
                                <button
                                    onClick={() => {
                                        if (selectedShop.lat && selectedShop.lng) {
                                            window.open(`maps://maps.apple.com/?daddr=${selectedShop.lat},${selectedShop.lng}`, '_blank');
                                        }
                                    }}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl hover:border-accent/40 hover:shadow-pink-soft transition-all group"
                                >
                                    <div className="w-12 h-12 bg-neutral-50 text-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                                        <div className="font-bold text-lg"></div>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-neutral-900 font-bold">Apple Maps</p>
                                        <p className="text-neutral-500 text-xs">For iPhone & Mac users</p>
                                    </div>
                                    <ChevronRight size={18} className="text-neutral-300 group-hover:text-accent transition-colors" />
                                </button>

                                {/* Copy Link */}
                                <button
                                    onClick={() => {
                                        const address = selectedShop.address || `${selectedShop.name}, ${selectedShop.locality}, Indore`;
                                        navigator.clipboard.writeText(address);
                                        // Simple elegant toast notification would be better, but console/copy is fine for now
                                    }}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl hover:border-accent/40 hover:shadow-pink-soft transition-all group"
                                >
                                    <div className="w-12 h-12 bg-accent/5 text-accent rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                                        <Copy size={20} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-neutral-900 font-bold">Copy Address</p>
                                        <p className="text-neutral-500 text-xs">Share or save for later</p>
                                    </div>
                                    <div className="text-[10px] font-bold text-accent uppercase opacity-0 group-hover:opacity-100 transition-opacity">Copy</div>
                                </button>
                            </div>

                            {/* Contact Section */}
                            <div className="flex items-center justify-between p-4 bg-primary/20 rounded-2xl border border-primary-dark/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-accent shadow-sm">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">Need help?</p>
                                        <p className="text-neutral-800 font-bold text-sm">Call the Boutique</p>
                                    </div>
                                </div>
                                <a 
                                    href={`tel:${selectedShop.phone || '+919876543210'}`}
                                    className="px-5 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:shadow-pink-md transition-all active:scale-95"
                                >
                                    Call Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
