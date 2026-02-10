export const COLORS = {
    // Backgrounds
    background: '#050B14',       // Deep Midnight
    card: '#0C1526',             // Navy Slate
    cardElevated: '#111C33',     // Elevated Surface

    // Accents
    primary: '#3B82F6',          // Royal Blue (Main CTA)
    secondary: '#06B6D4',        // Cyan Ice
    accent: '#8B5CF6',           // Soft Purple

    // Text
    textPrimary: '#F8FAFC',      // White-ish
    textSecondary: '#9CA3AF',    // Gray
    textTertiary: '#64748B',     // Darker Gray
    textInverse: '#FFFFFF',

    // Status
    success: '#22D3EE',          // Teal
    warning: '#F59E0B',
    error: '#EF4444',

    // Borders & Dividers
    border: '#1E293B',
    divider: '#1E293B',

    // Overlays
    overlay: 'rgba(5, 11, 20, 0.8)',
};

export const GRADIENTS = {
    primary: ['#3B82F6', '#06B6D4', '#8B5CF6'] as const, // Royal Blue -> Cyan -> Purple
    scan: ['#3B82F6', '#8B5CF6'] as const, // Blue -> Purple
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
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
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
