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
                primary: {
                    DEFAULT: '#022b1e',
                    dark: '#011a12',
                    light: '#03452f',
                },
                accent: {
                    DEFAULT: '#D4AF37',
                    hover: '#F0C84B',
                    muted: '#B8963A',
                },
                rose: {
                    gold: '#E8B4A0',
                },
                charcoal: {
                    DEFAULT: '#121212',
                    light: '#1a1a1a',
                    lighter: '#2a2a2a',
                },
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
