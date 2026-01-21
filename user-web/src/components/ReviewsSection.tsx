'use client';

import { useState, useEffect } from 'react';
import { getItemReviews, getImageUrl } from '@/lib/api';
import { FaStar } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface ReviewsSectionProps {
    itemId: string;
}

export function ReviewsSection({ itemId }: ReviewsSectionProps) {
    const [reviewsData, setReviewsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, [itemId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getItemReviews(itemId);
            setReviewsData(data);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-gray-400">Loading reviews...</div>
                </div>
            </div>
        );
    }

    if (!reviewsData || reviewsData.stats.totalReviews === 0) {
        return (
            <div className="py-12 px-6 bg-charcoal-lighter/50">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-2xl font-heading font-bold text-white mb-4">Ratings & Reviews</h2>
                    <p className="text-gray-400">No reviews yet. Be the first to review this item!</p>
                </div>
            </div>
        );
    }

    const { reviews, stats } = reviewsData;

    return (
        <div className="py-12 px-6 bg-charcoal-lighter/50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-8">Ratings & Reviews</h2>

                {/* Rating Summary */}
                <div className="bg-charcoal-lighter rounded-2xl p-6 md:p-8 mb-8 border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Overall Rating */}
                        <div className="text-center md:border-r border-white/10">
                            <div className="text-5xl font-bold text-white mb-2">
                                {stats.avgRating.toFixed(1)} <span className="text-accent">★</span>
                            </div>
                            <div className="text-gray-400">
                                {stats.totalReviews.toLocaleString()} Rating{stats.totalReviews !== 1 ? 's' : ''} & {stats.totalReviews} Review{stats.totalReviews !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="md:col-span-2 space-y-2">
                            {stats.distribution.map((item: any) => {
                                const percentage = stats.totalReviews > 0
                                    ? (item.count / stats.totalReviews) * 100
                                    : 0;

                                return (
                                    <div key={item.rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-12">
                                            <span className="text-sm text-gray-300">{item.rating}</span>
                                            <FaStar className="text-accent" size={12} />
                                        </div>
                                        <div className="flex-1 h-2 bg-charcoal rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-16 text-sm text-gray-400 text-right">
                                            {item.count.toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Review Images Gallery */}
                {reviews.some((r: any) => r.images && r.images.length > 0) && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Customer Photos</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {reviews
                                .filter((r: any) => r.images && r.images.length > 0)
                                .flatMap((r: any) => r.images)
                                .slice(0, 12)
                                .map((imageUrl: string, index: number) => (
                                    <div
                                        key={index}
                                        className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                                        onClick={() => setSelectedImage(getImageUrl(imageUrl))}
                                    >
                                        <img
                                            src={getImageUrl(imageUrl)}
                                            alt="Customer photo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Individual Reviews */}
                <div className="space-y-6">
                    {reviews.map((review: any) => (
                        <div key={review.id} className="bg-charcoal-lighter rounded-xl p-6 border border-white/5">
                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={i < review.rating ? 'text-accent' : 'text-gray-600'}
                                        size={16}
                                    />
                                ))}
                                <span className="ml-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                    {review.rating} ★
                                </span>
                            </div>

                            {/* Comment */}
                            {review.comment && (
                                <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>
                            )}

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-4 overflow-x-auto">
                                    {review.images.map((imageUrl: string, index: number) => (
                                        <div
                                            key={index}
                                            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-accent"
                                            onClick={() => setSelectedImage(getImageUrl(imageUrl))}
                                        >
                                            <img
                                                src={getImageUrl(imageUrl)}
                                                alt="Review"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* User Info */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-gray-400">
                                    <span className="font-medium text-gray-300">{review.user.name}</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-green-400">✓ Verified Purchase</span>
                                </div>
                                <div className="text-gray-500">
                                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={selectedImage}
                            alt="Review image"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition"
                            onClick={() => setSelectedImage(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
