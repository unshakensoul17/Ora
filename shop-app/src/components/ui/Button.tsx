import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    icon?: React.ReactNode;
    textStyle?: any;
}

export const Button = ({
    title,
    variant = 'primary',
    loading = false,
    icon,
    disabled,
    style,
    textStyle,
    ...props
}: ButtonProps) => {

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary': return styles.secondary;
            case 'outline': return styles.outline;
            case 'ghost': return styles.ghost;
            default: return styles.primary;
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'primary': return COLORS.textInverse;
            case 'ghost': return COLORS.textSecondary;
            default: return COLORS.primary;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.base,
                getButtonStyle(),
                disabled && styles.disabled,
                style
            ]}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && icon}
                    <Typography
                        variant="body"
                        bold
                        style={[{ color: getTextColor(), marginLeft: icon ? 8 : 0 }, textStyle]}
                    >
                        {title}
                    </Typography>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.m,
        paddingHorizontal: SPACING.l,
    },
    primary: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
});
