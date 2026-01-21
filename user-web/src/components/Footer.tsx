import Link from 'next/link';
import { MapPin, Phone, Instagram, MessageCircle, ExternalLink } from '@/components/ui/Icons';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-charcoal border-t border-white/10">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* About */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">F</span>
                            </div>
                            <span className="font-heading font-bold text-xl text-white">Fashcycle</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                            Indore's premier luxury outfit rental service. We bring designer fashion within reach for your special occasions — sanitized, fitted, and ready for your big day.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3">
                            <a
                                href="https://instagram.com/fashcycle"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-accent hover:border-accent hover:text-primary transition-all group"
                            >
                                <Instagram size={18} className="text-gray-400 group-hover:text-primary" />
                            </a>
                            <a
                                href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20rent%20an%20outfit"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-green-500 hover:border-green-500 transition-all group"
                            >
                                <MessageCircle size={18} className="text-gray-400 group-hover:text-white" />
                            </a>
                            <a
                                href="tel:+919876543210"
                                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-accent hover:border-accent hover:text-primary transition-all group"
                            >
                                <Phone size={18} className="text-gray-400 group-hover:text-primary" />
                            </a>
                        </div>
                    </div>

                    {/* Browse */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Browse</h3>
                        <ul className="space-y-3">
                            <li><Link href="/search?category=LEHENGA" className="text-gray-400 hover:text-accent text-sm transition-colors">Bridal Lehengas</Link></li>
                            <li><Link href="/search?category=SHERWANI" className="text-gray-400 hover:text-accent text-sm transition-colors">Sherwanis</Link></li>
                            <li><Link href="/search?category=SAREE" className="text-gray-400 hover:text-accent text-sm transition-colors">Sarees</Link></li>
                            <li><Link href="/search?category=ANARKALI" className="text-gray-400 hover:text-accent text-sm transition-colors">Anarkali Suits</Link></li>
                            <li><Link href="/search?category=INDO_WESTERN" className="text-gray-400 hover:text-accent text-sm transition-colors">Indo-Western</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
                        <ul className="space-y-3">
                            <li><Link href="/#how-it-works" className="text-gray-400 hover:text-accent text-sm transition-colors">How It Works</Link></li>
                            <li><Link href="/size-guide" className="text-gray-400 hover:text-accent text-sm transition-colors">Size Guide</Link></li>
                            <li><Link href="/faq" className="text-gray-400 hover:text-accent text-sm transition-colors">FAQs</Link></li>
                            <li><Link href="/hygiene" className="text-gray-400 hover:text-accent text-sm transition-colors">Hygiene Process</Link></li>
                            <li><Link href="/stores" className="text-gray-400 hover:text-accent text-sm transition-colors">Store Locations</Link></li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Policies</h3>
                        <ul className="space-y-3">
                            <li><Link href="/refund-policy" className="text-gray-400 hover:text-accent text-sm transition-colors">Refund Policy</Link></li>
                            <li><Link href="/cancellation-policy" className="text-gray-400 hover:text-accent text-sm transition-colors">Cancellation Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-accent text-sm transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-accent text-sm transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Store Location */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin size={20} className="text-accent" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Visit Our Boutique</h4>
                                <p className="text-gray-400 text-sm">
                                    123 Fashion Street, Vijay Nagar<br />
                                    Indore, Madhya Pradesh 452010
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Open: 11 AM - 9 PM (All Days)
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://maps.google.com/?q=Vijay+Nagar+Indore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-accent/30 text-accent rounded-lg hover:bg-accent/10 transition-all text-sm font-medium"
                        >
                            <MapPin size={16} />
                            Get Directions
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 bg-charcoal-light">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
                        <p className="text-gray-500 text-sm">
                            © {currentYear} Fashcycle. All Rights Reserved.
                        </p>
                        <p className="text-gray-600 text-xs">
                            Made with ♡ in Indore
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

