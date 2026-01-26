'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { apiClient } from '@/lib/api';

interface GalleryItem {
    id: string;
    rating: number;
    comment: string;
    images: string[];
    user: { name: string };
    item: {
        name: string;
        shop: { name: string; locality: string };
    };
}

export default function GalleryPage() {
    const [reviews, setReviews] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGallery();
    }, []);

    async function fetchGallery() {
        try {
            const response = await apiClient.get('/reviews/gallery');
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to load gallery:', error);
        } finally {
            setLoading(false);
        }
    }

    // Flatten images to display them individually but linked to the review
    const displayItems = reviews.flatMap(review =>
        review.images.map(image => ({
            ...review,
            displayImage: image
        }))
    );

    return (
        <main className="min-h-screen bg-gradient-to-b from-primary to-white pb-safe pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white/60 backdrop-blur-md py-4 px-6 sticky top-0 z-50 border-b border-accent-muted/20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="font-heading text-2xl font-bold text-accent">Fashcycle</Link>
                    <div className="flex gap-6">
                        <Link href="/search" className="text-neutral-700 hover:text-accent transition">Rent an Outfit</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-12 md:py-20 px-6 text-center">
                <h1 className="font-heading text-4xl md:text-6xl bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent mb-6 animate-slide-up">
                    Real Brides, <span className="text-accent">Real Style</span>
                </h1>
                <p className="text-xl text-neutral-700 max-w-2xl mx-auto animate-fade-in delay-100">
                    See how our community shines in Fashcycle rentals.
                    Get inspired by these stunning looks from weddings and special events across Indore.
                </p>
            </section>

            {/* Gallery Grid */}
            <section className="px-4 pb-20">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="text-accent text-xl">Loading beautiful moments...</div>
                        </div>
                    ) : displayItems.length === 0 ? (
                        <div className="text-center py-20 glass-card rounded-3xl">
                            <p className="text-neutral-600 text-lg mb-4">No photos yet.</p>
                            <Link
                                href="/my-orders"
                                className="inline-block px-8 py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent-hover transition"
                            >
                                Be the First to Post
                            </Link>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {displayItems.map((item, index) => (
                                <div
                                    key={`${item.id}-${index}`}
                                    className="break-inside-avoid glass-card rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden">
                                        <img
                                            src={item.displayImage}
                                            alt={`Worn by ${item.user.name}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <p className="text-white font-heading text-xl font-bold mb-1">{item.item.name}</p>
                                            <p className="text-accent text-sm mb-2">{item.item.shop.name}, {item.item.shop.locality}</p>

                                            {item.comment && (
                                                <p className="text-gray-300 text-sm line-clamp-2 italic">"{item.comment}"</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/60 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-neutral-900 font-medium text-sm">{item.user.name}</span>
                                            <div className="text-accent text-xs">{'★'.repeat(item.rating)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
