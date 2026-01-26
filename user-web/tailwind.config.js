/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary pinks - soft pastel to vibrant
                primary: {
                    DEFAULT: '#FFE5EC',    // Soft pastel pink
                    light: '#FFF0F5',      // Almost white pink
                    dark: '#FFB3C6',       // Medium pastel pink
                },
                accent: {
                    DEFAULT: '#FF69B4',    // Hot pink (vibrant accents)
                    hover: '#FF1493',      // Deep pink
                    muted: '#FFB6C1',      // Light pink
                    rose: '#FFC0CB',       // Rose pink
                },
                blush: {
                    DEFAULT: '#FFF0F5',    // Lavender blush
                    pink: '#FFE4E1',       // Misty rose
                    peach: '#FFDAB9',      // Peach puff
                },
                neutral: {
                    white: '#FFFFFF',
                    offWhite: '#FAFAFA',
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    500: '#6B7280',
                    700: '#374151',
                    900: '#111827',
                },
                // Keep charcoal for backwards compatibility during transition
                charcoal: {
                    DEFAULT: '#FAFAFA',    // Now maps to off-white
                    light: '#FFFFFF',      // Now maps to white
                    lighter: '#F9FAFB',    // Now maps to very light gray
                },
            },
            fontFamily: {
                heading: ['Outfit', 'Inter', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            letterSpacing: {
                tight: '-0.02em',
                normal: '0',
                wide: '0.02em',
            },
        },
    },
    plugins: [],
};
