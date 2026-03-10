import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { getShopDashboard } from '../../api/endpoints';
import { DashboardStats } from '../../api/types';
import { ReportsIcon } from '../../components/Icons';
import { Ionicons } from '@expo/vector-icons';


// DESIGN TOKENS
const COLORS = {
    // Background
    background: '#121212',
    card: '#1C1C1E',
    border: '#2C2C2E',

    // Brand Green -> Brand Gold
    primary: '#D4AF37',
    primaryDark: 'rgba(212, 175, 55, 0.15)',
    primaryGlow: 'rgba(212, 175, 55, 0.15)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',

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

    useFocusEffect(
        React.useCallback(() => {
            fetchDashboard();
        }, [shop?.id])
    );

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
                    <Text style={styles.greeting}>Welcome back!</Text>
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
                            <Ionicons name="qr-code-outline" size={24} color="#000" />
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
                        onPress={() => navigation.navigate('WalkInBooking')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="bag-handle-outline" size={24} color="#D4AF37" style={{ marginBottom: 8 }} />
                        <Text style={styles.secondaryActionText}>New Walk-In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => navigation.navigate('AddItem')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#D4AF37" style={{ marginBottom: 8 }} />
                        <Text style={styles.secondaryActionText}>Add Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => navigation.navigate('Holds')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="time-outline" size={24} color="#D4AF37" style={{ marginBottom: 8 }} />
                        <Text style={styles.secondaryActionText}>View Holds</Text>
                    </TouchableOpacity>
                </View>

                {/* KPI Section - Operational Highlights */}
                <Text style={styles.sectionTitle}>Daily Operations</Text>
                <View style={styles.kpiGrid}>
                    <TouchableOpacity
                        style={[styles.kpiCard, (stats?.bookings?.pickupsToday ?? 0) > 0 && styles.kpiCardHighlight]}
                        onPress={() => navigation.navigate('Bookings', { initialTab: 'pending', todayOnly: true })}
                    >
                        <Text style={[styles.kpiNumber, (stats?.bookings?.pickupsToday ?? 0) > 0 && { color: COLORS.primary }]}>
                            {stats?.bookings?.pickupsToday ?? 0}
                        </Text>
                        <Text style={styles.kpiLabel}>Pickups Today</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.kpiCard, (stats?.bookings?.returnsToday ?? 0) > 0 && styles.kpiCardHighlight]}
                        onPress={() => navigation.navigate('Bookings', { initialTab: 'active', todayOnly: true })}
                    >
                        <Text style={[styles.kpiNumber, (stats?.bookings?.returnsToday ?? 0) > 0 && { color: COLORS.warning }]}>
                            {stats?.bookings?.returnsToday ?? 0}
                        </Text>
                        <Text style={styles.kpiLabel}>Returns Today</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.kpiCard}
                        onPress={() => navigation.navigate('Bookings', { initialTab: 'active', todayOnly: false })}
                    >
                        <Text style={styles.kpiNumber}>{stats?.activeRentals ?? 0}</Text>
                        <Text style={styles.kpiLabel}>Items Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.kpiCard}
                        onPress={() => navigation.navigate('Bookings', { initialTab: 'pending', todayOnly: false })}
                    >
                        <Text style={styles.kpiNumber}>{stats?.activeHolds ?? 0}</Text>
                        <Text style={styles.kpiLabel}>Active Holds</Text>
                    </TouchableOpacity>
                </View>

                {/* Analysis Section */}
                <Text style={styles.sectionTitle}>Shop Analysis</Text>

                {/* Revenue & Growth */}
                <View style={styles.analysisCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.analysisTitle}>Financial Performance</Text>
                        {stats?.revenue && (
                            <View style={[styles.growthPill, { backgroundColor: stats.revenue.growth >= 0 ? 'rgba(29, 185, 84, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                <Text style={[styles.growthText, { color: stats.revenue.growth >= 0 ? COLORS.primary : COLORS.error }]}>
                                    {stats.revenue.growth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenue.growth)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.revenueRow}>
                        <View style={styles.revenueItem}>
                            <Text style={styles.revenueLabel}>Month Revenue</Text>
                            <Text style={styles.revenueValue}>₹{((stats?.revenue?.thisMonth ?? 0) / 100).toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.revenueDivider} />
                        <View style={styles.revenueItem}>
                            <Text style={styles.revenueLabel}>Avg Order</Text>
                            <Text style={styles.revenueValueSecondary}>₹{((stats?.analysis?.efficiency?.avgRentalPrice ?? 0) / 100).toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                </View>

                {/* Secondary Analysis Grid */}
                <View style={styles.analysisGrid}>
                    <View style={styles.smallAnalysisCard}>
                        <Text style={styles.analysisTitleSmall}>Inventory Use</Text>
                        <View style={styles.analysisMainRow}>
                            <Text style={styles.analysisValueLarge}>{stats?.inventory?.utilization ?? 0}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${stats?.inventory?.utilization ?? 0}%` }]} />
                        </View>
                    </View>

                    {stats?.analysis?.topCategories?.[0] && (
                        <View style={styles.smallAnalysisCard}>
                            <Text style={styles.analysisTitleSmall}>Top Category</Text>
                            <Text style={styles.analysisValueLarge} numberOfLines={1}>
                                {stats.analysis.topCategories[0].name}
                            </Text>
                            <Text style={styles.analysisSubtext}>
                                {stats.analysis.topCategories[0].count} rentals
                            </Text>
                        </View>
                    )}
                </View>

                {/* Reports Flashcard */}
                <TouchableOpacity
                    style={[styles.analysisCard, { backgroundColor: '#022b1e', borderColor: COLORS.primary }]}
                    onPress={() => navigation.navigate('Reports')}
                >
                    <View style={styles.reportsHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.analysisTitle, { color: COLORS.primary }]}>Business Reports</Text>
                            <Text style={styles.reportsSubtitle}>Export sales and inventory to Excel</Text>
                        </View>
                        <ReportsIcon color={COLORS.primary} size={32} focused />
                    </View>
                </TouchableOpacity>

                {/* Categories Breakdown */}
                <View style={styles.categoriesCard}>
                    <Text style={styles.analysisTitle}>Popular Collections</Text>
                    <View style={styles.categoryList}>
                        {stats?.analysis?.topCategories?.map((cat, idx) => (
                            <View key={cat.name} style={styles.categoryRow}>
                                <View style={styles.categoryInfo}>
                                    <Text style={styles.categoryRank}>{idx + 1}</Text>
                                    <View>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                        <Text style={styles.categorySubtext}>Performance leader</Text>
                                    </View>
                                </View>
                                <Text style={styles.categoryCount}>{cat.count} rents</Text>
                            </View>
                        ))}
                        {(!stats?.analysis?.topCategories || stats.analysis.topCategories.length === 0) && (
                            <Text style={styles.emptyAnalysisText}>No rental data yet</Text>
                        )}
                    </View>
                </View>

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

    // Analysis UI
    analysisCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    analysisTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    reportsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reportsSubtitle: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    growthPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    growthText: {
        fontSize: 12,
        fontWeight: '700',
    },
    analysisGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    smallAnalysisCard: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    analysisTitleSmall: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginBottom: SPACING.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    analysisValueLarge: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    analysisMainRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    analysisSubtext: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },
    categoriesCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl,
    },
    categoryList: {
        marginTop: SPACING.lg,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    categoryRank: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textTertiary,
        width: 20,
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    categorySubtext: {
        fontSize: 11,
        color: COLORS.textTertiary,
    },
    categoryCount: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    emptyAnalysisText: {
        color: COLORS.textTertiary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: SPACING.md,
    }
});
