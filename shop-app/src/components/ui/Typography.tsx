import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    color?: string;
    align?: 'left' | 'center' | 'right';
    bold?: boolean;
}

export const Typography = ({
    variant = 'body',
    color,
    align = 'left',
    bold,
    style,
    children,
    ...props
}: TypographyProps) => {

    const getStyle = () => {
        switch (variant) {
            case 'h1': return styles.h1;
            case 'h2': return styles.h2;
            case 'h3': return styles.h3;
            case 'caption': return styles.caption;
            case 'label': return styles.label;
            default: return styles.body;
        }
    };

    return (
        <Text
            style={[
                getStyle(),
                {
                    color: color || styles[variant as keyof typeof styles]?.color || COLORS.textPrimary,
                    textAlign: align,
                    fontWeight: bold ? 'bold' : getStyle().fontWeight,
                },
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        color: COLORS.textTertiary,
    },
});
