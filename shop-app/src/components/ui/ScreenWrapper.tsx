import React from 'react';
import { View, StyleSheet, StatusBar, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '../../constants/theme';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    withPadding?: boolean;
    withBottomPadding?: boolean; // New prop for FloatingDock space
}

export const ScreenWrapper = ({
    children,
    withPadding = false,
    withBottomPadding = false, // Default false, pages with Dock should set true
    style,
    ...props
}: ScreenWrapperProps) => {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View
                style={[
                    styles.container,
                    withPadding && { paddingHorizontal: LAYOUT.screenHorizontalPadding },
                    withBottomPadding && { paddingBottom: 100 }, // Extra space for FloatingDock
                    style
                ]}
                {...props}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});
