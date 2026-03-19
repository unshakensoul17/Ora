import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ORA Admin',
    description: 'Admin control panel for ORA platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-900 text-white">{children}</body>
        </html>
    );
}
