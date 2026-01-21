import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getShopDashboard } from '../../api/endpoints';
import { DashboardStats } from '../../api/types';

// DESIGN TOKENS
const COLORS = {
    // Background
    background: '#0B0F0D',
    card: '#101814',
    border: '#1F2A23',

    // Brand Green
    primary: '#1DB954',
    primaryDark: '#0F2A1D',
    primaryGlow: 'rgba(29, 185, 84, 0.15)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',

    // Accent
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
};

const TYPOGRAPHY = {
    heading: { fontSize: 20, fontWeight: '600' as const },
    kpiNumber: { fontSize: 30, fontWeight: '700' as const },
    kpiLabel: { fontSize: 13, fontWeight: '500' as const },
    bodySmall: { fontSize: 12, fontWeight: '400' as const },
    button: { fontSize: 14, fontWeight: '600' as const },
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

export default function DashboardScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Animate on mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const fetchDashboard = async () => {
        if (!shop?.id) return;
        setError(null);
        try {
            const data = await getShopDashboard(shop.id);
            setStats(data);
        } catch (err: any) {
            console.error('Failed to fetch dashboard:', err);
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [shop?.id]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDashboard();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboard();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
            showsVerticalScrollIndicator={false}
        >
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Welcome back 👋</Text>
                    <Text style={styles.shopName}>{shop?.name || 'Shop Dashboard'}</Text>
                </View>

                {/* Primary Action - Scan QR (Green Highlight) */}
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => navigation.navigate('Scanner')}
                    activeOpacity={0.85}
                >
                    <View style={styles.primaryActionGlow} />
                    <View style={styles.primaryActionContent}>
                        <View style={styles.primaryActionIcon}>
                            <Text style={styles.primaryActionIconText}>📷</Text>
                        </View>
                        <View style={styles.primaryActionTextContainer}>
                            <Text style={styles.primaryActionTitle}>Scan QR Code</Text>
                            <Text style={styles.primaryActionSubtitle}>Verify pickup or return</Text>
                        </View>
                        <Text style={styles.primaryActionArrow}>→</Text>
                    </View>
                </TouchableOpacity>

                {/* Secondary Actions */}
                <View style={styles.secondaryActions}>
                    <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => navigation.navigate('AddItem')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryActionIcon}>➕</Text>
                        <Text style={styles.secondaryActionText}>Add Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => navigation.navigate('Holds')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryActionIcon}>⏳</Text>
                        <Text style={styles.secondaryActionText}>View Holds</Text>
                    </TouchableOpacity>
                </View>

                {/* KPI Section */}
                <Text style={styles.sectionTitle}>Today's Overview</Text>
                <View style={styles.kpiGrid}>
                    {/* Active Holds - Green accent */}
                    <View style={[styles.kpiCard, styles.kpiCardHighlight]}>
                        <Text style={[styles.kpiNumber, { color: COLORS.primary }]}>{stats?.activeHolds ?? 0}</Text>
                        <Text style={styles.kpiLabel}>Active Holds</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiNumber}>{stats?.pendingPickups ?? 0}</Text>
                        <Text style={styles.kpiLabel}>Pending Pickup</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiNumber}>{stats?.activeRentals ?? 0}</Text>
                        <Text style={styles.kpiLabel}>Active Rentals</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiNumber}>{stats?.totalItems ?? 0}</Text>
                        <Text style={styles.kpiLabel}>Total Items</Text>
                    </View>
                </View>

                {/* Monthly Stats */}
                <View style={styles.monthlyCard}>
                    <Text style={styles.monthlyTitle}>📊 This Month</Text>
                    <View style={styles.monthlyContent}>
                        <Text style={styles.monthlyNumber}>{stats?.verifiedLeads ?? 0}</Text>
                        <Text style={styles.monthlyLabel}>Verified Walk-ins</Text>
                    </View>
                    <View style={styles.monthlyFooter}>
                        <Text style={styles.monthlyFooterText}>
                            ₹{(stats?.verifiedLeads ?? 0) * 50} in lead charges
                        </Text>
                    </View>
                </View>

                {/* Revenue */}
                {stats?.revenue && (
                    <View style={styles.revenueCard}>
                        <Text style={styles.revenueTitle}>💰 Revenue</Text>
                        <View style={styles.revenueRow}>
                            <View style={styles.revenueItem}>
                                <Text style={styles.revenueLabel}>This Month</Text>
                                <Text style={styles.revenueValue}>
                                    ₹{(stats.revenue.thisMonth / 100).toLocaleString('en-IN')}
                                </Text>
                            </View>
                            <View style={styles.revenueDivider} />
                            <View style={styles.revenueItem}>
                                <Text style={styles.revenueLabel}>Last Month</Text>
                                <Text style={styles.revenueValueSecondary}>
                                    ₹{(stats.revenue.lastMonth / 100).toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 32 }} />
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 16,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: 8,
    },
    retryText: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },

    // Header
    header: {
        marginBottom: SPACING.xxl,
        marginTop: SPACING.sm,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    shopName: {
        ...TYPOGRAPHY.heading,
        fontSize: 24,
        color: COLORS.textPrimary,
    },

    // Primary Action (Scan QR - Green Highlight)
    primaryAction: {
        position: 'relative',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    primaryActionGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.primaryGlow,
    },
    primaryActionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    primaryActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryActionIconText: {
        fontSize: 24,
    },
    primaryActionTextContainer: {
        flex: 1,
    },
    primaryActionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 2,
    },
    primaryActionSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    primaryActionArrow: {
        fontSize: 24,
        color: COLORS.primary,
    },

    // Secondary Actions
    secondaryActions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xxl,
    },
    secondaryAction: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        alignItems: 'center',
    },
    secondaryActionIcon: {
        fontSize: 24,
        marginBottom: SPACING.sm,
    },
    secondaryActionText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },

    // KPI Section
    sectionTitle: {
        ...TYPOGRAPHY.heading,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.xxl,
    },
    kpiCard: {
        width: '47%',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
    },
    kpiCardHighlight: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryDark,
    },
    kpiNumber: {
        ...TYPOGRAPHY.kpiNumber,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    kpiLabel: {
        ...TYPOGRAPHY.kpiLabel,
        color: COLORS.textSecondary,
    },

    // Monthly Stats
    monthlyCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    monthlyTitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
        fontWeight: '500',
    },
    monthlyContent: {
        marginBottom: SPACING.md,
    },
    monthlyNumber: {
        fontSize: 48,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    monthlyLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    monthlyFooter: {
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    monthlyFooterText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '500',
    },

    // Revenue
    revenueCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.xl,
    },
    revenueTitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
        fontWeight: '500',
    },
    revenueRow: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    revenueItem: {
        flex: 1,
    },
    revenueDivider: {
        width: 1,
        backgroundColor: COLORS.border,
    },
    revenueLabel: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginBottom: SPACING.sm,
        fontWeight: '500',
    },
    revenueValue: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.primary,
    },
    revenueValueSecondary: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
});
