'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecommendedItems, getImageUrl, type InventoryItem } from '@/lib/api';

interface RecommendedProductsProps {
    itemId: string;
}

export function RecommendedProducts({ itemId }: RecommendedProductsProps) {
    const router = useRouter();
    const [products, setProducts] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [itemId]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const data = await getRecommendedItems(itemId);
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12 px-6 bg-charcoal">
                <div className="max-w-6xl mx-auto">
                    <div className="text-gray-400">Loading recommendations...</div>
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    const formatPrice = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

    return (
        <div className="py-12 px-6 bg-charcoal">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-8">
                    You may also like
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => {
                        const imageUrl = product.images && product.images.length > 0
                            ? getImageUrl(product.images[0])
                            : '';

                        return (
                            <div
                                key={product.id}
                                className="group cursor-pointer"
                                onClick={() => router.push(`/item/${product.id}`)}
                            >
                                {/* Image */}
                                <div className="aspect-[3/4] bg-charcoal-lighter rounded-xl overflow-hidden mb-3 relative">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full opacity-80"
                                            style={{
                                                background: product.category === 'LEHENGA'
                                                    ? 'linear-gradient(135deg, #8B0000, #DC143C)'
                                                    : product.category === 'SHERWANI'
                                                        ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
                                                        : 'linear-gradient(135deg, #2d4a3e, #1a3a2e)'
                                            }}
                                        />
                                    )}
                                    <div className="absolute top-3 right-3 bg-accent/90 px-2 py-1 rounded-full text-primary text-xs font-bold">
                                        {product.category}
                                    </div>
                                </div>

                                {/* Details */}
                                <div>
                                    <div className="text-xs text-accent mb-1">
                                        📍 {product.shop.locality}
                                    </div>
                                    <h3 className="text-neutral-900 font-semibold mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-accent font-bold text-lg">
                                            {formatPrice(product.rentalPrice)}
                                        </span>
                                        <span className="text-gray-500 text-sm">/rental</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
