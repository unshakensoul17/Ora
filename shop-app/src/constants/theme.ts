export const COLORS = {
    // Backgrounds
    background: '#121212',       // Premium Dark Charcoal
    card: '#1C1C1E',             // Elevated Charcoal
    cardElevated: '#2C2C2E',     // Higher Elevation Charcoal

    // Accents
    primary: '#D4AF37',          // Elegant Gold (Main CTA)
    secondary: '#E6C27A',        // Soft Gold
    accent: '#B8860B',           // Deep Gold

    // Text
    textPrimary: '#FFFFFF',      // White
    textSecondary: '#A1A1AA',    // Soft Gray (Zinc-400)
    textTertiary: '#71717A',     // Darker Gray (Zinc-500)
    textInverse: '#121212',      // Inverse (for text on gold)

    // Status
    success: '#10B981',          // Emerald Green
    warning: '#F59E0B',          // Amber
    error: '#EF4444',            // Red
    info: '#3B82F6',             // Blue (Confirmed)

    // Borders & Dividers
    border: '#2C2C2E',           // Subtle Border
    divider: '#2C2C2E',          // Subtle Divider

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
};

export const GRADIENTS = {
    primary: ['#D4AF37', '#E6C27A', '#B8860B'] as const, // Subtle Gold Gradient
    scan: ['#D4AF37', '#B8860B'] as const,               // Gold Scan Line
    glass: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] as const,
};

export const SPACING = {
    xs: 8,
    s: 12,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
    xxxl: 56,
    grid: 8,
};

export const RADIUS = {
    s: 12,
    m: 20,
    l: 28,
    xl: 32,
    full: 9999,
};

export const SHADOWS = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 8,
    },
    glow: {
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
    },
};

export const LAYOUT = {
    screenHorizontalPadding: 20,
    screenVerticalPadding: 20,
};
