import Link from 'next/link';
import { SearchWidget } from '@/components/SearchWidget';
import { FeaturedItems } from '@/components/FeaturedItems';
import { TrustBar } from '@/components/TrustBar';
import { Footer } from '@/components/Footer';
import { CategorySection } from '@/components/CategorySection';
import { Search, MapPin, Sparkles, Clock, CheckCircle } from '@/components/ui/Icons';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Background gradient with subtle pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-charcoal" />

                {/* Decorative orbs - softer */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-light/10 rounded-full blur-[80px]" />

                {/* Content */}
                <div className="relative z-10 text-center max-w-5xl px-6 animate-slide-up">
                    {/* Main Heading */}
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-white drop-shadow-lg">Wear Designer.</span>
                        <br />
                        <span className="text-accent drop-shadow-lg">Spend High-Street.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light max-w-2xl mx-auto">
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
                                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 hover:border-accent/30 transition-all"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-accent-hover text-primary font-semibold rounded-xl shadow-luxury-lg glow-gold hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                            <Search size={20} />
                            Find Your Outfit
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="px-8 py-4 border-2 border-accent/50 text-accent font-semibold rounded-xl hover:bg-accent/10 transition-all backdrop-blur-sm"
                        >
                            How It Works
                        </Link>
                    </div>

                    {/* Reassurance Microtext */}
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
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
                    <h2 className="font-heading text-3xl text-center mb-2 text-white">
                        Find Your Perfect Outfit
                    </h2>
                    <p className="text-gray-400 text-center mb-8">
                        Search by occasion, dates, and size
                    </p>
                    <SearchWidget />
                </div>
            </section>

            {/* Featured Collection */}
            <section className="py-16 px-6 bg-charcoal-light">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-3xl md:text-4xl text-white mb-3">
                            Trending This Wedding Season
                        </h2>
                        <p className="text-gray-400">
                            Curated collection of premium designer outfits
                        </p>
                    </div>
                    <FeaturedItems />
                    <div className="text-center mt-10">
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-accent/30 text-accent font-medium rounded-lg hover:bg-accent/10 transition-all"
                        >
                            View All Outfits
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-6 bg-primary">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-3xl md:text-4xl text-white mb-3">
                            Reserve Online. Try In-Store.
                        </h2>
                        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                            No full payment online. Reserve your outfit for 4 hours, visit the boutique,
                            try it on, and pay only if you love it.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Step 1 */}
                        <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl shadow-luxury hover:-translate-y-1 transition-all">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-lg shadow-luxury">
                                1
                            </div>
                            <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                                <Search size={28} className="text-accent" />
                            </div>
                            <h3 className="text-accent font-heading text-xl font-bold mb-3">
                                Browse & Reserve
                            </h3>
                            <p className="text-gray-300">
                                Find your outfit, select dates, and place a hold with zero upfront payment.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl shadow-luxury hover:-translate-y-1 transition-all">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-lg shadow-luxury">
                                2
                            </div>
                            <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                                <MapPin size={28} className="text-accent" />
                            </div>
                            <h3 className="text-accent font-heading text-xl font-bold mb-3">
                                Visit the Boutique
                            </h3>
                            <p className="text-gray-300">
                                Show your QR code and try the outfit in person at our Indore store.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl shadow-luxury hover:-translate-y-1 transition-all">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-lg shadow-luxury">
                                3
                            </div>
                            <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                                <Sparkles size={28} className="text-accent" />
                            </div>
                            <h3 className="text-accent font-heading text-xl font-bold mb-3">
                                Rent & Shine
                            </h3>
                            <p className="text-gray-300">
                                Love it? Pay the rental fee and take it home for your special event.
                            </p>
                        </div>
                    </div>

                    {/* Reassurance Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mb-10 py-6 border-y border-white/10">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-accent" />
                            <span className="text-gray-300 text-sm">Reservation holds for <strong className="text-white">4 hours</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-400" />
                            <span className="text-gray-300 text-sm">Average pickup time: <strong className="text-white">7 minutes</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Sparkles size={20} className="text-blue-400" />
                            <span className="text-gray-300 text-sm"><strong className="text-white">100%</strong> sanitized outfits</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-accent to-accent-hover text-primary font-semibold rounded-xl shadow-luxury-lg glow-gold hover:shadow-xl transition-all hover:-translate-y-1"
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

