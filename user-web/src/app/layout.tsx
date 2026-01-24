import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileHeader } from '@/components/MobileHeader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
    title: 'Fashcycle - Luxury Designer Outfit Rental in Indore',
    description: 'Rent premium designer Indian wedding outfits in Indore. Reserve online, try in-store. Lehengas, Sherwanis, Sarees — 100% sanitized, fitted, and ready.',
    keywords: ['fashion rental', 'wedding outfits', 'lehenga rental', 'sherwani rental', 'Indore', 'bridal lehenga', 'groom sherwani'],
    openGraph: {
        title: 'Fashcycle - Luxury Designer Outfit Rental',
        description: 'Rent premium designer Indian wedding outfits in Indore. Reserve online, try in-store.',
        type: 'website',
        locale: 'en_IN',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${playfair.variable} font-body bg-charcoal text-white`}>
                <Providers>
                    <Navbar />
                    <MobileHeader />
                    {children}
                    {/* Global Conversion Elements */}
                    <WhatsAppButton />
                    <MobileBottomNav />
                </Providers>
            </body>
        </html>
    );
}

