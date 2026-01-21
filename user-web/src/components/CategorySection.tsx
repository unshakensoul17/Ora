'use client';

import Link from 'next/link';
import { Heart, Crown, Sparkles, Star, ChevronRight } from '@/components/ui/Icons';

export function CategorySection() {
    const categories = [
        {
            id: 'wedding',
            title: 'The Wedding Store',
            subtitle: 'Bridal & Groom Collections',
            icon: Heart,
            href: '/search?occasion=WEDDING',
            gradient: 'from-[#8B0000] to-[#DC143C]', // Deep Red/Crimson
            accent: 'text-red-200'
        },
        {
            id: 'sherwani',
            title: 'Royal Sherwanis',
            subtitle: 'For the Modern Groom',
            icon: Crown,
            href: '/search?category=SHERWANI',
            gradient: 'from-[#1a1a2e] to-[#16213e]', // Royal Navy
            accent: 'text-blue-200'
        },
        {
            id: 'lehenga',
            title: 'Designer Lehengas',
            subtitle: 'Crafted for Elegance',
            icon: Sparkles,
            href: '/search?category=LEHENGA',
            gradient: 'from-[#831843] to-[#BE185D]', // Pink/Rose
            accent: 'text-pink-200'
        },
        {
            id: 'new',
            title: 'New Arrivals',
            subtitle: 'Fresh for the Season',
            icon: Star,
            href: '/search',
            gradient: 'from-[#064e3b] to-[#059669]', // Emerald
            accent: 'text-emerald-200'
        }
    ];

    return (
        <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="font-heading text-3xl md:text-4xl text-white mb-2">
                            Shop by Category
                        </h2>
                        <p className="text-gray-400">
                            Explore our curated collections
                        </p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className="group relative h-80 rounded-2xl overflow-hidden shadow-luxury transition-all duration-500 hover:-translate-y-2 hover:shadow-luxury-lg"
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 transition-transform duration-700 group-hover:scale-110`} />

                            {/* Texture Overlay (Noise/Grain optional, simplified here directly) */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                                {/* Top Icon */}
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                                    <category.icon size={24} className="text-white" />
                                </div>

                                {/* Bottom Info */}
                                <div>
                                    <h3 className="font-heading text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
                                        {category.title}
                                    </h3>
                                    <p className={`text-sm ${category.accent} font-medium mb-4 opacity-90 group-hover:opacity-100 transition-opacity`}>
                                        {category.subtitle}
                                    </p>

                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-3 transition-all duration-300">
                                        Explorer Collection
                                        <div className="bg-white/20 rounded-full p-1">
                                            <ChevronRight size={14} />
                                        </div>
                                    </span>
                                </div>
                            </div>

                            {/* Shine Effect on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
