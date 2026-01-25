'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';

// Flexible interface that handles both nested and flat structures
interface BookingItem {
    name: string;
    shop?: {
        locality?: string;
    };
}

interface BookingDetails {
    id: string;
    inventoryItem?: BookingItem;
    item?: BookingItem;
    shop?: { locality?: string };
    pickupDate?: string;
    returnDate?: string;
    startDate?: string;
    endDate?: string;
    expiresAt?: string;
    holdExpiresAt?: string;
    qrCodeHash?: string;
    qrCode?: string;
    dates?: { start?: string; end?: string };
}

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingData: {
        qrCode?: string;
        qrCodeHash?: string;
        booking?: BookingDetails;
    } & Partial<BookingDetails> | null;
}

export default function QRCodeModal({ isOpen, onClose, bookingData }: QRCodeModalProps) {
    const router = useRouter();

    if (!isOpen || !bookingData) return null;

    function getTimeRemaining(expiresAt: string) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    }

    // Helper to safely access data whether it's from backend (flat) or demo (nested)
    const booking = bookingData.booking || bookingData;
    const item = booking.inventoryItem || booking.item;
    const shop = item?.shop || booking.shop;
    const pickupDate = booking.pickupDate || booking.startDate || booking.dates?.start;
    const returnDate = booking.returnDate || booking.endDate || booking.dates?.end;

    // Get QR code hash - check multiple possible locations
    const qrCodeHash = bookingData.qrCodeHash || booking.qrCodeHash || bookingData.qrCode || booking.qrCode;

    // Generate QR code value matching backend format
    const qrValue = `fashcycle://booking/${booking.id}?hash=${qrCodeHash}`;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={onClose}
        >
            <div
                className="bg-gray-900 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl border border-emerald-500/30"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Success Header */}
                <div className="text-center mb-5">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Reservation Confirmed!</h2>
                    <p className="text-gray-400 text-sm">Your outfit is on hold</p>
                </div>

                {/* Booking Details */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <h3 className="text-white font-semibold text-sm">{item?.name || 'Unknown Item'}</h3>
                    <p className="text-gray-500 text-xs mb-3">
                        {shop?.locality || 'Unknown Location'}
                    </p>

                    <div className="flex justify-between text-xs mb-3">
                        <div>
                            <p className="text-gray-500">Pickup</p>
                            <p className="text-white font-medium">{pickupDate ? new Date(pickupDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500">Return</p>
                            <p className="text-white font-medium">{returnDate ? new Date(returnDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-amber-400 text-xs font-medium text-center">
                            ⏰ Hold expires in {getTimeRemaining(booking.expiresAt || booking.holdExpiresAt || '')}
                        </p>
                    </div>
                </div>

                {/* Real Scannable QR Code */}
                <div className="text-center mb-4">
                    <p className="text-gray-400 text-xs mb-3">Show this QR code at the shop</p>
                    <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                        <QRCodeSVG
                            value={qrValue}
                            size={140}
                            level="M"
                            includeMargin={false}
                            bgColor="#ffffff"
                            fgColor="#000000"
                        />
                    </div>
                    <p className="text-gray-600 text-xs mt-2">Booking ID: {(booking?.id || '').slice(0, 12)}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            onClose();
                            router.push('/my-holds');
                        }}
                        className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                    >
                        View My Holds
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
