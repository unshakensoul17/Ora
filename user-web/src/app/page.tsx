import Link from 'next/link';
import { SearchWidget } from '@/components/SearchWidget';
import { FeaturedItems } from '@/components/FeaturedItems';
import { TrustBar } from '@/components/TrustBar';
import { Footer } from '@/components/Footer';
import { CategorySection } from '@/components/CategorySection';
import { Search, MapPin, Sparkles, Clock, CheckCircle } from '@/components/ui/Icons';

export default function HomePage() {
    return (
        <main className="min-h-screen pb-safe pb-20 md:pb-0">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Background gradient with subtle pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blush via-primary to-white" />

                {/* Decorative orbs - softer pink */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-muted/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[100px]" />

                {/* Content */}
                <div className="relative z-10 text-center max-w-5xl px-6 animate-slide-up">
                    {/* Main Heading */}
                    <h1 className="font-heading text-4xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent drop-shadow-sm">Wear Designer.</span>
                        <br />
                        <span className="bg-gradient-to-r from-accent via-accent-hover to-accent bg-clip-text text-transparent drop-shadow-sm">Spend High-Street.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-700 mb-8 font-medium max-w-2xl mx-auto">
                        Indore's Premier Luxury Rental Wardrobe.
                        <br className="hidden sm:block" />
                        Sanitized, Fitted & Ready for Your Special Day.
                    </p>

                    {/* Quick Category Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {['Lehenga', 'Sherwani', 'Saree', 'Indo-Western', 'Anarkali'].map((cat) => (
                            <Link
                                key={cat}
                                href={`/search?category=${cat.toUpperCase().replace('-', '_')}`}
                                className="px-5 py-2.5 rounded-full glass-card text-neutral-700 text-sm font-medium hover:text-accent hover:shadow-pink-soft transition-all"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-2xl shadow-pink-lg glow-pink hover:shadow-pink-lg hover:scale-105 transition-all"
                        >
                            <Search size={20} />
                            Find Your Outfit
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="hidden sm:inline-block px-8 py-4 border-2 border-accent/40 text-accent font-semibold rounded-2xl hover:bg-accent/10 hover:border-accent/60 transition-all backdrop-blur-sm"
                        >
                            How It Works
                        </Link>
                    </div>

                    {/* Reassurance Microtext */}
                    <p className="text-neutral-600 text-sm flex items-center justify-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        Reserve in 60 seconds — pay in-store only
                    </p>
                </div>
            </section>

            {/* Trust Bar */}
            <TrustBar />

            {/* Categories */}
            <CategorySection />

            {/* Search Widget */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-heading text-3xl text-center mb-2 bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent">
                        Find Your Perfect Outfit
                    </h2>
                    <p className="text-neutral-600 text-center mb-8">
                        Search by occasion, dates, and size
                    </p>
                    <SearchWidget />
                </div>
            </section>

            {/* Featured Collection */}
            <section className="py-16 px-6 bg-gradient-to-b from-white to-blush-pink">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-3xl md:text-4xl bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent mb-3">
                            Trending This Wedding Season
                        </h2>
                        <p className="text-neutral-600">
                            Curated collection of premium designer outfits
                        </p>
                    </div>
                    <FeaturedItems />
                    <div className="text-center mt-10">
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-accent/40 text-accent font-medium rounded-xl hover:bg-accent/10 hover:border-accent/60 transition-all"
                        >
                            View All Outfits
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-3xl md:text-4xl bg-gradient-to-r from-neutral-900 via-accent to-neutral-900 bg-clip-text text-transparent mb-3">
                            Reserve Online. Try In-Store.
                        </h2>
                        <p className="text-neutral-700 text-lg max-w-2xl mx-auto">
                            No full payment online. Reserve your outfit for 24 hours, visit the boutique,
                            try it on, and pay only if you love it.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Step 1 */}
                        <div className="relative glass-card p-8 rounded-2xl floating-card">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center text-white font-bold text-lg shadow-pink-md">
                                1
                            </div>
                            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                                <Search size={28} className="text-accent" />
                            </div>
                            <h3 className="text-accent font-heading text-xl font-bold mb-3">
                                Browse & Reserve
                            </h3>
                            <p className="text-neutral-700">
                                Find your outfit, select dates, and place a hold with zero upfront payment.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative glass-card p-8 rounded-2xl floating-card">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center text-white font-bold text-lg shadow-pink-md">
                                2
                            </div>
                            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                                <MapPin size={28} className="text-accent" />
                            </div>
                            <h3 className="text-accent font-heading text-xl font-bold mb-3">
                                Visit the Boutique
                            </h3>
                            <p className="text-neutral-700">
                                Show your QR code and try the outfit in person at our Indore store.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative glass-card p-8 rounded-2xl floating-card">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center text-white font-bold text-lg shadow-pink-md">
                                3
                            </div>
                            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles size={28} className="text-accent" />
                            </div>
                            <h3 className="text-accent font-heading text-xl font-bold mb-3">
                                Rent & Shine
                            </h3>
                            <p className="text-neutral-700">
                                Love it? Pay the rental fee and take it home for your special event.
                            </p>
                        </div>
                    </div>

                    {/* Reassurance Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mb-10 py-6 border-y border-accent-muted/20">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-accent" />
                            <span className="text-neutral-700 text-sm">Reservation holds for <strong className="text-neutral-900">24 hours</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-500" />
                            <span className="text-neutral-700 text-sm">Average pickup time: <strong className="text-neutral-900">7 minutes</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Sparkles size={20} className="text-blue-500" />
                            <span className="text-neutral-700 text-sm"><strong className="text-neutral-900">100%</strong> sanitized outfits</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-2xl shadow-pink-lg glow-pink hover:scale-105 transition-all"
                        >
                            <Search size={20} />
                            Start Reservation
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </main>
    );
}

