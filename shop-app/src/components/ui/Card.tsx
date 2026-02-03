import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface CardProps extends ViewProps {
    variant?: 'primary' | 'elevated' | 'outlined';
    padding?: keyof typeof SPACING;
}

export const Card = ({
    variant = 'primary',
    padding = 'm',
    style,
    children,
    ...props
}: CardProps) => {

    const getVariantStyle = () => {
        switch (variant) {
            case 'elevated': return styles.elevated;
            case 'outlined': return styles.outlined;
            default: return styles.primary;
        }
    };

    return (
        <View
            style={[
                styles.base,
                getVariantStyle(),
                { padding: SPACING[padding] },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: RADIUS.m,
        overflow: 'hidden',
    },
    primary: {
        backgroundColor: COLORS.card,
        ...SHADOWS.soft,
    },
    elevated: {
        backgroundColor: COLORS.cardElevated,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
});
