'use client';

import { useState, useEffect } from 'react';
import { WhatsApp } from '@/components/ui/Icons';

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
}

export function WhatsAppButton({
    phoneNumber = '919876543210',
    message = 'Hi, I want to rent an outfit from Fashcycle!'
}: WhatsAppButtonProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // Show button after scrolling past hero section
        const handleScroll = () => {
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-show tooltip after 5 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setShowTooltip(true);
                // Hide after 5 seconds
                setTimeout(() => setShowTooltip(false), 5000);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 hidden md:block">
            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full right-0 mb-3 animate-fade-in">
                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-luxury-lg text-sm font-medium whitespace-nowrap">
                        Need styling help? Chat now 💬
                        <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white transform rotate-45" />
                    </div>
                </div>
            )}

            {/* Button */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="group flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-luxury-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
                aria-label="Chat on WhatsApp"
            >
                <WhatsApp size={28} className="text-white" />

                {/* Ping animation */}
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                </span>
            </a>
        </div>
    );
}
