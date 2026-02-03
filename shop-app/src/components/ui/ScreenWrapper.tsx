import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, ViewProps } from 'react-native';
import { COLORS, LAYOUT } from '../../constants/theme';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    withPadding?: boolean;
}

export const ScreenWrapper = ({
    children,
    withPadding = false,
    style,
    ...props
}: ScreenWrapperProps) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View
                style={[
                    styles.container,
                    withPadding && { paddingHorizontal: LAYOUT.screenHorizontalPadding },
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
