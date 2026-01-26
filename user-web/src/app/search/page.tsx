'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchWidget } from '@/components/SearchWidget';
import { Footer } from '@/components/Footer';
import { searchItems, getImageUrl, type InventoryItem } from '@/lib/api';
import { CheckCircle, Sparkles, Star, Eye, ChevronRight } from '@/components/ui/Icons';

const formatPrice = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

// Calculate extra day rate (roughly 1/3 of 3-day rate)
function getExtraDayRate(rentalPrice: number): number {
    return Math.round(rentalPrice / 3 / 100) * 100;
}

function SearchResults() {
    const searchParams = useSearchParams();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Get active filters for display
    const activeCategory = searchParams.get('category');
    const activeOccasion = searchParams.get('occasion');
    const activeSize = searchParams.get('size');

    useEffect(() => {
        loadSearchResults();
    }, [searchParams]);

    async function loadSearchResults() {
        try {
            setLoading(true);
            setError('');

            const params: any = {};

            const q = searchParams.get('q');
            const category = searchParams.get('category');
            const size = searchParams.get('size');
            const locality = searchParams.get('locality');
            const occasion = searchParams.get('occasion');
            const maxPrice = searchParams.get('maxPrice');

            if (q) params.q = q;
            if (category) params.category = category;
            if (size) params.size = size;
            if (locality) params.locality = locality;
            if (occasion) params.occasion = occasion;
            if (maxPrice) params.maxPrice = parseInt(maxPrice);

            params.limit = 20;

            const response = await searchItems(params);
            setItems(response.items || []);
        } catch (err) {
            console.error('Failed to search items:', err);
            setError('Failed to load search results. Please try again.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                        <div className="aspect-[3/4] bg-neutral-200" />
                        <div className="p-5 space-y-3">
                            <div className="h-3 bg-neutral-200 rounded w-1/2" />
                            <div className="h-5 bg-neutral-200 rounded w-3/4" />
                            <div className="h-6 bg-neutral-200 rounded w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                    onClick={loadSearchResults}
                    className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">No items found</h2>
                <p className="text-neutral-600 mb-6">Try adjusting your search filters</p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/search"
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition font-medium"
                    >
                        Clear Filters
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 border-2 border-accent-muted/40 text-neutral-700 rounded-lg hover:bg-accent/10 hover:border-accent/50 transition font-medium"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Results Count & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <p className="text-neutral-600">
                    Showing <span className="text-neutral-900 font-semibold">{items.length}</span> results
                    {activeCategory && <span className="text-accent ml-1">in {activeCategory.replace('_', ' ')}</span>}
                    {activeOccasion && <span className="text-accent ml-1">for {activeOccasion}</span>}
                </p>
                {(activeCategory || activeOccasion || activeSize) && (
                    <Link
                        href="/search"
                        className="text-sm text-accent hover:underline"
                    >
                        Clear all filters
                    </Link>
                )}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => {
                    const imageUrl = item.images && item.images.length > 0
                        ? getImageUrl(item.images[0])
                        : '';

                    const isTopRated = (item.timesRented || 0) > 5;
                    const isDryCleaned = item.condition === 'EXCELLENT';

                    return (
                        <div
                            key={item.id}
                            className="glass-card rounded-2xl overflow-hidden group hover:border-accent/40 transition-all duration-300 flex flex-col shadow-pink-soft hover:shadow-pink-md"
                        >
                            {/* Image Container */}
                            <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />

                                {/* Tags */}
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
                                        <span className="inline-flex items-center gap-1 text-xs bg-accent/90 text-white px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                                            <Star size={12} />
                                            Top Rated
                                        </span>
                                    )}
                                </div>

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
                                                ? 'linear-gradient(135deg, #FFB6C1, #FF69B4)'
                                                : item.category === 'SHERWANI'
                                                    ? 'linear-gradient(135deg, #FFF0F5, #FFE5EC)'
                                                    : item.category === 'SAREE'
                                                        ? 'linear-gradient(135deg, #FFDAB9, #FFB3C6)'
                                                        : 'linear-gradient(135deg, #FFE4E1, #FFC0CB)'
                                        }}
                                    />
                                )}

                                {/* Location & Size badges */}
                                <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between">
                                    <span className="text-xs bg-black/60 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
                                        📍 {item.shop?.locality || 'Indore'}
                                    </span>
                                    {item.size && (
                                        <span className="text-xs bg-white/10 text-white px-2 py-1 rounded font-medium backdrop-blur-sm border border-white/20">
                                            Size: {item.size}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-5 flex flex-col flex-1">
                                <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                                    {item.brand || item.category.replace('_', ' ')}
                                </p>
                                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                                    {item.name}
                                </h3>

                                {/* Pricing */}
                                <div className="mb-3">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-accent font-heading">
                                            {formatPrice(item.rentalPrice)}
                                        </span>
                                        <span className="text-neutral-600 text-sm">/ 3 days</span>
                                    </div>
                                    <p className="text-neutral-500 text-xs mt-1">
                                        Extra day {formatPrice(getExtraDayRate(item.rentalPrice))}
                                    </p>
                                </div>

                                <div className="flex-1" />

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-auto">
                                    <Link
                                        href={`/item/${item.id}`}
                                        className="flex-1 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-white text-center font-semibold rounded-lg text-sm hover:shadow-pink-md transition-all"
                                    >
                                        Reserve
                                    </Link>
                                    <Link
                                        href={`/item/${item.id}`}
                                        className="px-4 py-2.5 border-2 border-accent-muted/40 text-neutral-700 rounded-lg text-sm font-medium hover:bg-accent/10 hover:border-accent/50 transition-all flex items-center gap-1.5"
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
        </>
    );
}

export default function SearchPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-primary to-white pt-20 pb-safe pb-20 md:pb-0">
            {/* Breadcrumb Navigation */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-accent-muted/20">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-neutral-600 hover:text-accent transition-colors">
                            Home
                        </Link>
                        <ChevronRight size={14} className="text-neutral-400" />
                        <span className="text-neutral-900 font-semibold">Search</span>
                    </nav>
                </div>
            </div>

            {/* Search Section */}
            <section className="py-8 px-6 bg-gradient-to-b from-blush-pink to-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-heading text-2xl bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent mb-6 text-center">
                        Find Your Perfect Outfit
                    </h1>
                    <SearchWidget />
                </div>
            </section>

            {/* Results */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <Suspense fallback={<div className="text-neutral-500">Loading...</div>}>
                        <SearchResults />
                    </Suspense>
                </div>
            </section>

            <Footer />
        </main>
    );
}

