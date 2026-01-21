'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Sparkles, Star, Eye } from '@/components/ui/Icons';

import { getMarketplaceItems, getImageUrl, type InventoryItem } from '@/lib/api';

function formatPrice(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

// Calculate extra day rate (roughly 1/3 of 3-day rate)
function getExtraDayRate(rentalPrice: number): number {
    return Math.round(rentalPrice / 3 / 100) * 100; // Round to nearest 100 paise
}

export function FeaturedItems() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMarketplaceItems({ limit: 8 })
            .then(data => {
                setItems(data.items || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch items:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-charcoal border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                        <div className="aspect-[3/4] bg-gray-800" />
                        <div className="p-5 space-y-3">
                            <div className="h-3 bg-gray-800 rounded w-1/2" />
                            <div className="h-5 bg-gray-800 rounded w-3/4" />
                            <div className="h-6 bg-gray-800 rounded w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No items available yet</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
                const imageUrl = item.images && item.images.length > 0
                    ? getImageUrl(item.images[0])
                    : '';

                const isTopRated = (item.timesRented || 0) > 5;
                const isDryCleaned = item.condition === 'EXCELLENT';

                return (
                    <div
                        key={item.id}
                        className="bg-charcoal border border-white/5 rounded-2xl overflow-hidden group hover:border-accent/30 transition-all duration-300 flex flex-col shadow-luxury"
                    >
                        {/* Image Container */}
                        <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent z-10" />

                            {/* Tags - Top Left */}
                            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1 text-xs bg-green-500/90 text-white px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                                    <CheckCircle size={12} />
                                    Available
                                </span>
                                {isDryCleaned && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-500/90 text-white px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                                        <Sparkles size={12} />
                                        Dry Cleaned
                                    </span>
                                )}
                                {isTopRated && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-accent/90 text-primary px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                                        <Star size={12} />
                                        Top Rated
                                    </span>
                                )}
                            </div>

                            {/* Image */}
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={item.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div
                                    className="absolute inset-0 opacity-80 group-hover:scale-105 transition-transform duration-500"
                                    style={{
                                        background: item.category === 'LEHENGA'
                                            ? 'linear-gradient(135deg, #8B0000, #DC143C)'
                                            : item.category === 'SHERWANI'
                                                ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
                                                : 'linear-gradient(135deg, #2d4a3e, #1a3a2e)'
                                    }}
                                />
                            )}

                            {/* Location Badge - Bottom Left */}
                            <div className="absolute bottom-3 left-3 z-20">
                                <span className="text-xs bg-black/60 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
                                    📍 {item.shop?.locality || 'Indore'}
                                </span>
                            </div>

                            {/* Size Badge - Bottom Right */}
                            {item.size && (
                                <div className="absolute bottom-3 right-3 z-20">
                                    <span className="text-xs bg-white/10 text-white px-2 py-1 rounded font-medium backdrop-blur-sm border border-white/20">
                                        Size: {item.size}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="p-5 flex flex-col flex-1">
                            {/* Category */}
                            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                {item.category.replace('_', ' ')}
                            </p>

                            {/* Name - max 2 lines */}
                            <h3 className="font-heading text-lg font-semibold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
                                {item.name}
                            </h3>

                            {/* Pricing */}
                            <div className="mb-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-accent font-heading">
                                        {formatPrice(item.rentalPrice)}
                                    </span>
                                    <span className="text-gray-400 text-sm">/ 3 days</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">
                                    Extra day {formatPrice(getExtraDayRate(item.rentalPrice))}
                                </p>
                                {item.securityDeposit && (
                                    <p className="text-gray-500 text-xs">
                                        Deposit: {formatPrice(item.securityDeposit)}
                                    </p>
                                )}
                            </div>

                            {/* Spacer to push buttons to bottom */}
                            <div className="flex-1" />

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-auto">
                                <Link
                                    href={`/item/${item.id}`}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-primary text-center font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-accent/30 transition-all"
                                >
                                    Reserve
                                </Link>
                                <Link
                                    href={`/item/${item.id}`}
                                    className="px-4 py-2.5 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-1.5"
                                >
                                    <Eye size={16} />
                                    <span className="hidden sm:inline">View</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

