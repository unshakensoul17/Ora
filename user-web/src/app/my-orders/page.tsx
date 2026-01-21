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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-charcoal flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-charcoal">
            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">My Wardrobe</h1>
                    <p className="text-gray-400">Track your past rentals and upcoming returns</p>
                </header>

                {orders.length === 0 ? (
                    <div className="glass-panel p-12 rounded-2xl text-center border border-white/10">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h3 className="text-xl text-white font-medium mb-2">No orders yet</h3>
                        <p className="text-gray-400 mb-8">You haven't rented any outfits yet. Time to find something special!</p>
                        <button
                            onClick={() => router.push('/search')}
                            className="px-8 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            Browse Collection
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6">
                                {/* Image */}
                                <div className="w-full md:w-32 h-32 relative rounded-xl overflow-hidden bg-charcoal-light flex-shrink-0">
                                    <img
                                        src={getImageUrl(order.item.images[0])}
                                        alt={order.item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-grow">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                                        <h3 className="text-xl font-bold text-white">{order.item.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-2 md:mt-0 
                                            ${order.status === 'RETURNED' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'RENTED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4">{order.item.shop.locality}, Indore</p>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-gray-500">Rental Period</p>
                                            <p className="text-gray-300">
                                                {format(new Date(order.startDate), 'MMM d')} - {format(new Date(order.endDate), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Total Paid</p>
                                            <p className="text-accent font-medium">₹{(order.platformPrice / 100).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex flex-col justify-center items-end min-w-[140px] gap-3">
                                    {/* Show QR Code for RENTED items (for return) */}
                                    {order.status === 'RENTED' && order.qrCodeUrl && (
                                        <button
                                            onClick={() => {
                                                setSelectedBookingId(order.id);
                                                setShowQRModal(true);
                                            }}
                                            className="w-full px-6 py-3 bg-accent text-primary hover:bg-accent/90 rounded-lg font-semibold transition-all"
                                        >
                                            Show QR Code
                                        </button>
                                    )}

                                    {/* Review Button Logic */}
                                    {order.status === 'RETURNED' && !order.review ? (
                                        <button
                                            onClick={() => handleOpenReview(order.id)}
                                            className="w-full px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-primary rounded-lg font-semibold transition-all"
                                        >
                                            Write Review
                                        </button>
                                    ) : order.review ? (
                                        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/5 text-center w-full">
                                            <div className="text-accent text-lg mb-1">
                                                {'★'.repeat(order.review.rating)}
                                                <span className="text-gray-600">{'★'.repeat(5 - order.review.rating)}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Reviewed</p>
                                        </div>
                                    ) : order.status !== 'RENTED' && (
                                        <button className="w-full px-6 py-3 bg-gray-700/50 text-gray-500 rounded-lg cursor-not-allowed text-sm">
                                            Review Unavailable
                                        </button>
                                    )}
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
