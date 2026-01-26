'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from '@/components/ui/Icons';

const occasions = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'reception', label: 'Reception' },
    { value: 'sangeet', label: 'Sangeet' },
    { value: 'mehendi', label: 'Mehendi' },
    { value: 'haldi', label: 'Haldi' },
    { value: 'party', label: 'Party' },
    { value: 'engagement', label: 'Engagement' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];

const categories = [
    { value: 'LEHENGA', label: 'Lehenga' },
    { value: 'SHERWANI', label: 'Sherwani' },
    { value: 'SAREE', label: 'Saree' },
    { value: 'ANARKALI', label: 'Anarkali' },
    { value: 'INDO_WESTERN', label: 'Indo-Western' },
    { value: 'KURTA_PAJAMA', label: 'Kurta Set' },
];

const durationOptions = [
    { days: 1, label: '1 Day' },
    { days: 3, label: '3 Days' },
    { days: 5, label: '5 Days' },
    { days: 7, label: '7 Days' },
];

const suggestedSearches = [
    { query: 'Wedding Groom', category: 'SHERWANI' },
    { query: 'Sangeet', occasion: 'sangeet' },
    { query: 'Reception Bride', category: 'LEHENGA' },
    { query: 'Party Wear', occasion: 'party' },
];

export function SearchWidget() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [occasion, setOccasion] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [size, setSize] = useState('');
    const [category, setCategory] = useState('');
    const [duration, setDuration] = useState(3);
    const [maxPrice, setMaxPrice] = useState(5000);

    // Initialize filters from URL parameters
    useEffect(() => {
        const urlCategory = searchParams.get('category');
        const urlOccasion = searchParams.get('occasion');
        const urlStartDate = searchParams.get('startDate');
        const urlEndDate = searchParams.get('endDate');
        const urlSize = searchParams.get('size');
        const urlMaxPrice = searchParams.get('maxPrice');

        if (urlCategory) setCategory(urlCategory);
        if (urlOccasion) setOccasion(urlOccasion);
        if (urlStartDate) setStartDate(urlStartDate);
        if (urlEndDate) setEndDate(urlEndDate);
        if (urlSize) setSize(urlSize);
        if (urlMaxPrice) setMaxPrice(parseInt(urlMaxPrice) / 100); // Convert from paise to rupees
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (occasion) params.set('occasion', occasion);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        if (size) params.set('size', size);
        if (maxPrice < 5000) params.set('maxPrice', String(maxPrice * 100)); // Convert to paise

        router.push(`/search?${params.toString()}`);
    };

    const handleSuggestedSearch = (search: typeof suggestedSearches[0]) => {
        const params = new URLSearchParams();
        if (search.category) params.set('category', search.category);
        if (search.occasion) params.set('occasion', search.occasion);
        router.push(`/search?${params.toString()}`);
    };

    // Set end date based on duration
    const handleDurationChange = (days: number) => {
        setDuration(days);
        if (startDate) {
            const start = new Date(startDate);
            start.setDate(start.getDate() + days - 1);
            setEndDate(start.toISOString().split('T')[0]);
        }
    };

    // Get tomorrow's date for minimum date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <form onSubmit={handleSearch} className="glass-card rounded-2xl p-6 md:p-8 shadow-pink-lg">
            {/* Duration Quick Chips */}
            <div className="mb-6">
                <label className="form-label">How long do you need it?</label>
                <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar snap-x">
                    {durationOptions.map((opt) => (
                        <button
                            key={opt.days}
                            type="button"
                            onClick={() => handleDurationChange(opt.days)}
                            className={`chip whitespace-nowrap snap-start ${duration === opt.days ? 'chip-active' : ''}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mb-6">
                <label className="form-label">Category</label>
                <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar snap-x">
                    <button
                        type="button"
                        onClick={() => setCategory('')}
                        className={`chip whitespace-nowrap snap-start ${category === '' ? 'chip-active' : ''}`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`chip whitespace-nowrap snap-start ${category === cat.value ? 'chip-active' : ''}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Occasion */}
                <div>
                    <label className="form-label">Occasion</label>
                    <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="form-select"
                    >
                        <option value="">All Occasions</option>
                        {occasions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="form-label">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            // Auto-set end date based on duration
                            if (e.target.value) {
                                const start = new Date(e.target.value);
                                start.setDate(start.getDate() + duration - 1);
                                setEndDate(start.toISOString().split('T')[0]);
                            }
                        }}
                        min={minDate}
                        className="form-input"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="form-label">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || minDate}
                        className="form-input"
                    />
                </div>

                {/* Size */}
                <div>
                    <label className="form-label">Your Size</label>
                    <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="form-select"
                    >
                        <option value="">Any Size</option>
                        {sizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Budget Slider */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="form-label mb-0">Budget (per rental)</label>
                    <span className="text-accent font-semibold">
                        Up to ₹{maxPrice.toLocaleString('en-IN')}
                    </span>
                </div>
                <input
                    type="range"
                    min={500}
                    max={5000}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-neutral-500 text-xs mt-1">
                    <span>₹500</span>
                    <span>₹5,000+</span>
                </div>
            </div>

            {/* Search Button */}
            <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-xl shadow-pink-lg glow-pink hover:shadow-pink-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
                <Search size={20} />
                Search Outfits
            </button>

            {/* Suggested Searches */}
            <div className="mt-6 pt-6 border-t border-accent-muted/20">
                <p className="text-neutral-600 text-xs uppercase tracking-wider mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((search, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestedSearch(search)}
                            className="text-sm text-neutral-700 hover:text-accent transition-colors"
                        >
                            {search.query}
                            {index < suggestedSearches.length - 1 && <span className="text-neutral-400 ml-2">•</span>}
                        </button>
                    ))}
                </div>
            </div>
        </form>
    );
}

