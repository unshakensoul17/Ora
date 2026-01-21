'use client';

import { useState, useRef, MouseEvent } from 'react';

interface ImageZoomProps {
    src: string;
    alt: string;
    className?: string;
    zoomScale?: number;
}

export default function ImageZoom({
    src,
    alt,
    className = '',
    zoomScale = 2
}: ImageZoomProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPosition({ x, y });
    };

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    return (
        <div
            ref={imageRef}
            className={`relative overflow-hidden cursor-zoom-in ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img
                src={src}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
                style={{
                    transform: isZoomed
                        ? `scale(${zoomScale})`
                        : 'scale(1)',
                    transformOrigin: `${position.x}% ${position.y}%`,
                }}
            />
        </div>
    );
}
