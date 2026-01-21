'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Footer } from '@/components/Footer';
import { getItemById, createHold, getItemMonthlyCalendar, type InventoryItem } from '@/lib/api';
import QRCodeModal from '@/components/QRCodeModal';
import { useAuth } from '@/context/AuthContext';
import { RecommendedProducts } from '@/components/RecommendedProducts';
import { ReviewsSection } from '@/components/ReviewsSection';
import ImageZoom from '@/components/ImageZoom';
import { ChevronRight, CheckCircle, Sparkles, MapPin } from '@/components/ui/Icons';

const formatPrice = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

// Calculate extra day rate (roughly 1/3 of 3-day rate)
function getExtraDayRate(rentalPrice: number): number {
    return Math.round(rentalPrice / 3 / 100) * 100;
}

export default function ItemDetailPage() {
    const params = useParams();
    const router = useRouter();
    const itemId = params.id as string;
    const { user } = useAuth();

    const [item, setItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isReserving, setIsReserving] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);
    const [error, setError] = useState('');
    const [calendarData, setCalendarData] = useState<any[]>([]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    useEffect(() => {
        loadItem();
        fetchCalendarData(new Date());
    }, [itemId]);

    async function loadItem() {
        try {
            setLoading(true);
            setError('');
            const data = await getItemById(itemId);
            setItem(data);
        } catch (error) {
            console.error('Failed to load item:', error);
            setError('Failed to load item details. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchCalendarData(date: Date) {
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const data = await getItemMonthlyCalendar(itemId, month, year);
            setCalendarData(data);
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        }
    }

    async function handleReserve() {
        // Check if user is logged in
        if (!user) {
            router.push(`/login?returnTo=/item/${itemId}`);
            return;
        }

        if (!startDate || !endDate) {
            setError('Please select rental dates');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            setError('Return date must be after pickup date');
            return;
        }

        setIsReserving(true);
        setError('');

        try {
            const response = await createHold({
                userId: user.id,  // Use authenticated user ID
                itemId: itemId,
                startDate: startDate,
                endDate: endDate,
            });

            setBookingData(response);
            setShowQRModal(true);
        } catch (error: any) {
            console.error('Failed to create hold:', error);
            setError(error.response?.data?.message || 'Failed to reserve item. Please try again.');
        } finally {
            setIsReserving(false);
        }
    }

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];
            const dayData = calendarData.find(d => d.date === dateStr);

            if (dayData) {
                if (dayData.status === 'blocked') return 'calendar-tile-blocked';
                if (dayData.status === 'hold') return 'calendar-tile-hold';
                if (dayData.status === 'maintenance') return 'calendar-tile-maintenance';
                if (dayData.status === 'available') return 'calendar-tile-available';
            }
        }
        return ''
    };

    const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];
            const dayData = calendarData.find(d => d.date === dateStr);
            // Disable if blocked or maintenance
            return dayData?.status === 'blocked' || dayData?.status === 'maintenance';
        }
        return false;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-charcoal flex items-center justify-center pt-20">
                <div className="text-accent text-xl">Loading item details...</div>
            </div>
        );
    }

    if (error && !item) {
        return (
            <div className="min-h-screen bg-charcoal flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="text-white text-xl mb-4">{error}</div>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={loadItem}
                            className="px-6 py-3 bg-accent text-primary rounded-lg hover:bg-accent-hover transition"
                        >
                            Retry
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-charcoal flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="text-white text-xl mb-4">Item not found</div>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-accent text-primary rounded-lg hover:bg-accent-hover transition"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = item.images && item.images.length > 0
        ? (item.images[0].startsWith('http')
            ? item.images[0]
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/inventory-images/${item.images[0]}`)
        : '';

    return (
        <main className="min-h-screen bg-charcoal pt-20">
            {/* Breadcrumb Navigation */}
            <div className="bg-charcoal-light border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <nav className="flex items-center gap-2 text-sm flex-wrap">
                        <Link href="/" className="text-gray-400 hover:text-accent transition-colors">
                            Home
                        </Link>
                        <ChevronRight size={14} className="text-gray-600" />
                        <Link href="/search" className="text-gray-400 hover:text-accent transition-colors">
                            Browse
                        </Link>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className="text-white font-medium truncate max-w-[200px]">
                            {item.name}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Item Detail */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Gallery */}
                        <div>
                            <div className="aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden relative shadow-luxury-lg">
                                {imageUrl ? (
                                    <ImageZoom
                                        src={imageUrl}
                                        alt={item.name}
                                        className="aspect-[3/4]"
                                        zoomScale={2.5}
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 opacity-80"
                                        style={{
                                            background: item.category === 'LEHENGA'
                                                ? 'linear-gradient(135deg, #8B0000, #DC143C)'
                                                : item.category === 'SHERWANI'
                                                    ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
                                                    : 'linear-gradient(135deg, #2d4a3e, #1a3a2e)'
                                        }}
                                    />
                                )}

                                {/* Tags */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/90 text-white px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                                        <CheckCircle size={14} />
                                        Available
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/90 text-white px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                                        <Sparkles size={14} />
                                        Dry Cleaned
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            {/* Location Badge */}
                            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full mb-4">
                                <MapPin size={14} />
                                {item.shop.locality}
                            </div>

                            <p className="text-gray-500 text-sm uppercase tracking-wide mb-2">{item.brand}</p>
                            <h1 className="font-heading text-4xl font-bold text-white mb-4">{item.name}</h1>

                            <p className="text-gray-400 mb-8 leading-relaxed">{item.description}</p>

                            {/* Details Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-charcoal-lighter p-4 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Size</p>
                                    <p className="text-white font-semibold">{item.size}</p>
                                </div>
                                <div className="bg-charcoal-lighter p-4 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Color</p>
                                    <p className="text-white font-semibold">{item.color}</p>
                                </div>
                                <div className="bg-charcoal-lighter p-4 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Category</p>
                                    <p className="text-white font-semibold">{item.category.replace('_', ' ')}</p>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-charcoal-lighter p-6 rounded-xl border border-accent/20 mb-8 shadow-luxury">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-4xl font-bold text-accent font-heading">
                                        {formatPrice(item.rentalPrice)}
                                    </span>
                                    <span className="text-lg text-gray-500">/ 3 days</span>
                                </div>
                                <p className="text-gray-500 text-sm mb-3">
                                    Extra day: {formatPrice(getExtraDayRate(item.rentalPrice))}
                                </p>
                                <div className="flex gap-4 text-sm text-gray-400">
                                    <span>Security Deposit: {formatPrice(item.securityDeposit)}</span>
                                </div>
                                {item.retailPrice && (
                                    <p className="text-rose-gold text-sm mt-3 font-medium">
                                        ✨ Save {formatPrice(item.retailPrice - item.rentalPrice)} compared to buying
                                    </p>
                                )}
                            </div>

                            {/* Visual Availability Calendar */}
                            <div className="bg-charcoal-lighter p-6 rounded-xl mb-6 border border-accent/10">
                                <h3 className="text-accent font-semibold mb-4 flex items-center gap-2">
                                    <span>📅</span> Availability Calendar
                                </h3>
                                <div className="glass-panel rounded-xl p-4">
                                    <Calendar
                                        onChange={() => { }}
                                        value={null}
                                        view="month"
                                        onActiveStartDateChange={({ activeStartDate }) => activeStartDate && fetchCalendarData(activeStartDate)}
                                        tileClassName={tileClassName}
                                        tileDisabled={tileDisabled}
                                        minDate={new Date()}
                                        className="w-full"
                                    />
                                    <div className="flex gap-6 mt-6 text-sm justify-center flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-green-500/40" style={{ background: 'rgba(16, 185, 129, 0.08)' }}></div>
                                            <span className="text-gray-300">Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-yellow-500/40" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.2) 100%)' }}></div>
                                            <span className="text-gray-300">On Hold</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-red-500/40" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.2) 100%)' }}></div>
                                            <span className="text-gray-300">Booked</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-gray-500/40" style={{ background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.2) 100%)' }}></div>
                                            <span className="text-gray-300">Maintenance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="bg-charcoal-lighter p-6 rounded-xl mb-6">
                                <h3 className="text-accent font-semibold mb-4">Select Rental Dates</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">From</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            min={minDate}
                                            className="w-full bg-charcoal border border-accent/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">To</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate || minDate}
                                            className="w-full bg-charcoal border border-accent/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Reserve Button */}
                            <button
                                onClick={handleReserve}
                                disabled={isReserving}
                                className="w-full py-4 bg-gradient-to-r from-accent to-accent-hover text-primary font-bold text-lg rounded-xl shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isReserving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                        Reserving...
                                    </span>
                                ) : (
                                    'Reserve for Trial (4-hour hold)'
                                )}
                            </button>

                            <p className="text-center text-gray-500 text-sm mt-4">
                                No payment required now. Visit the boutique to try and rent.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recommended Products */}
            <RecommendedProducts itemId={itemId} />

            {/* Reviews Section */}
            <ReviewsSection itemId={itemId} />

            <Footer />

            {/* QR Code Modal */}
            <QRCodeModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                bookingData={bookingData}
            />
        </main>
    );
}
