'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders, getImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReviewModal } from '@/components/ReviewModal';
import QRCodeModal from '@/components/QRCodeModal';
import { format } from 'date-fns';

export default function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?returnTo=/my-orders');
            return;
        }

        if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        try {
            const data = await getUserOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setReviewModalOpen(true);
    };

    const handleReviewSuccess = () => {
        fetchOrders(); // Refresh to update review status
    };

    const renderActionButtons = (order: any) => {
        return (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                {/* Show QR Code for RENTED items (for return) */}
                {order.status === 'RENTED' && order.qrCodeUrl && (
                    <button
                        onClick={() => {
                            setSelectedBookingId(order.id);
                            setShowQRModal(true);
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-accent text-white hover:bg-accent/90 rounded-xl font-bold transition-all shadow-sm hover:shadow-pink-md"
                    >
                        Show QR Code
                    </button>
                )}

                {/* Review Button Logic */}
                {order.status === 'RETURNED' && !order.review ? (
                    <button
                        onClick={() => handleOpenReview(order.id)}
                        className="w-full sm:w-auto px-6 py-2.5 border-2 border-accent text-accent hover:bg-gradient-to-r hover:from-accent hover:to-accent-hover hover:text-white hover:border-transparent rounded-xl font-bold transition-all shadow-sm"
                    >
                        Write Review
                    </button>
                ) : order.review ? (
                    <div className="bg-green-50/50 px-4 py-2 rounded-xl border border-green-200 text-center w-full sm:w-auto shadow-sm flex items-center gap-2">
                        <div className="text-accent text-sm tracking-widest">
                            {'★'.repeat(order.review.rating)}
                            <span className="text-neutral-300">{'★'.repeat(5 - order.review.rating)}</span>
                        </div>
                        <p className="text-[10px] text-green-700 font-bold uppercase">Reviewed</p>
                    </div>
                ) : order.status !== 'RENTED' && (
                    <div className="px-4 py-2 bg-neutral-100 text-neutral-400 border border-neutral-200 rounded-xl text-xs font-semibold uppercase tracking-wider">
                        Review Unavailable
                    </div>
                )}
            </div>
        );
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-primary to-white pb-safe pb-20 md:pb-0">
            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent mb-2">My Wardrobe</h1>
                    <p className="text-neutral-600">Track your past rentals and upcoming returns</p>
                </header>

                {orders.length === 0 ? (
                    <div className="glass-card p-12 rounded-2xl text-center">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h3 className="text-xl text-neutral-900 font-medium mb-2">No orders yet</h3>
                        <p className="text-neutral-600 mb-8">You haven't rented any outfits yet. Time to find something special!</p>
                        <button
                            onClick={() => router.push('/search')}
                            className="px-8 py-3.5 bg-gradient-to-r from-accent to-accent-hover text-white font-bold rounded-xl shadow-pink-md hover:shadow-pink-lg hover:-translate-y-0.5 transition-all"
                        >
                            Browse Collection
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 relative overflow-hidden group hover:shadow-pink-md transition-all duration-300">
                                {/* Image Area */}
                                <div className="flex gap-4 sm:flex-shrink-0">
                                    <div className="w-24 h-32 sm:w-32 sm:h-44 relative rounded-xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-100 flex-shrink-0">
                                        <img
                                            src={getImageUrl(order.item.images[0])}
                                            alt={order.item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-1.5 left-1.5">
                                            <div className="bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Details (partially visible next to image) */}
                                    <div className="sm:hidden flex-grow flex flex-col justify-between py-0.5">
                                        <div>
                                            <h3 className="text-base font-bold text-neutral-900 truncate pr-2 leading-tight mb-1">{order.item.name}</h3>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border mb-2
                                                ${order.status === 'RETURNED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    order.status === 'RENTED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                                                {order.status}
                                            </span>
                                            <p className="text-neutral-500 text-[10px] flex items-center gap-1">
                                                <span className="opacity-70">📍</span> {order.item.shop.locality}
                                            </p>
                                        </div>
                                        <div className="bg-accent/5 p-1.5 rounded-lg border border-accent/10">
                                            <p className="text-[10px] text-accent font-bold">₹{(order.platformPrice / 100).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Details / Mobile Bottom Details */}
                                <div className="flex-grow flex flex-col justify-between min-w-0">
                                    <div className="hidden sm:block">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-neutral-900">{order.item.name}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
                                                ${order.status === 'RETURNED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    order.status === 'RENTED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-neutral-500 text-sm mb-4 flex items-center gap-1">
                                            <span className="opacity-70">📍</span> {order.item.shop.locality}, Indore
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[11px] sm:text-sm mb-4 sm:mb-6 bg-white/40 p-3 sm:p-4 rounded-xl border border-neutral-100/50">
                                        <div>
                                            <p className="text-neutral-500 mb-0.5 font-medium uppercase text-[9px] sm:text-[10px] tracking-wider">Rental Period</p>
                                            <p className="text-neutral-800 font-semibold">
                                                {format(new Date(order.startDate), 'MMM d')} - {format(new Date(order.endDate), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <div className="hidden sm:block sm:text-right">
                                            <p className="text-neutral-500 mb-0.5 font-medium uppercase text-[10px] tracking-wider">Total Paid</p>
                                            <p className="text-accent font-bold text-lg">₹{(order.platformPrice / 100).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-auto">
                                        {renderActionButtons(order)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />

            <ReviewModal
                bookingId={selectedBookingId}
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                onSuccess={handleReviewSuccess}
            />

            {/* QR Code Modal for Returns */}
            <QRCodeModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                bookingData={orders.find(o => o.id === selectedBookingId)}
            />
        </main>
    );
}
