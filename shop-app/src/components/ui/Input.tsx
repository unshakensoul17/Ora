import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    containerStyle?: any;
}

export const Input = ({
    label,
    error,
    rightIcon,
    onRightIconPress,
    style,
    containerStyle,
    ...props
}: InputProps) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Typography variant="label">{label}</Typography>}
            <View style={[
                styles.inputContainer,
                error ? styles.errorBorder : null,
                props.multiline && { height: 'auto', minHeight: 56, paddingVertical: 12, alignItems: 'flex-start' }
            ]}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={COLORS.textTertiary}
                    cursorColor={COLORS.primary}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.iconContainer}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Typography variant="caption" style={{ color: COLORS.error, marginTop: 4 }}>
                    {error}
                </Typography>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121917', // Slightly darker than card for depth
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.m,
        height: 56,
        paddingHorizontal: SPACING.m,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 16,
        height: '100%',
    },
    iconContainer: {
        padding: SPACING.xs,
    },
    errorBorder: {
        borderColor: COLORS.error,
    },
});
