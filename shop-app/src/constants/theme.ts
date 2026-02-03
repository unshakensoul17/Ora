export const COLORS = {
    // Backgrounds
    background: '#0A0F1C',       // Main Background
    card: '#111827',             // Primary Cards
    cardElevated: '#1F2937',     // Elevated Cards

    // Accents
    primary: '#34F5C5',          // Accent Mint
    primaryDark: '#2BC9A1',      // Darker Mint for press states
    info: '#3B82F6',             // Info Blue

    // Text
    textPrimary: '#F9FAFB',      // Primary Text
    textSecondary: '#9CA3AF',    // Secondary Text
    textTertiary: '#6B7280',     // Tertiary Text
    textInverse: '#0A0F1C',      // Text on primary buttons

    // Status
    success: '#34F5C5',
    error: '#EF4444',
    warning: '#F59E0B',

    // Borders & Dividers
    border: '#1F2937',           // Subtle borders matches elevated card
    divider: '#1F2937',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999,
};

export const SHADOWS = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 4,
    },
    glow: {
        shadowColor: '#34F5C5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
};

export const LAYOUT = {
    screenHorizontalPadding: SPACING.m,
};
