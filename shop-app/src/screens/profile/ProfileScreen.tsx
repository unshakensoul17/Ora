import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Clipboard, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useFocusEffect } from '@react-navigation/native';
import { getShopProfile } from '../../api/endpoints';

// DESIGN TOKENS (matching Dashboard)
const COLORS = {
    background: '#0B0F0D',
    card: '#101814',
    border: '#1F2A23',
    primary: '#1DB954',
    primaryDark: '#0F2A1D',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    success: '#10B981',
    error: '#EF4444',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

export default function ProfileScreen({ navigation }: any) {
    const { shop, logout, setShop } = useAuthStore();
    const [copiedShopId, setCopiedShopId] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch fresh shop data when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadShopData();
        }, [shop?.id])
    );

    const loadShopData = async () => {
        if (!shop?.id) return;
        setLoading(true);
        try {
            const freshShopData = await getShopProfile(shop.id);
            setShop(freshShopData);
        } catch (error) {
            console.error('Failed to load shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                },
            ]
        );
    };

    const handleCopyShopId = () => {
        if (shop?.id) {
            Clipboard.setString(shop.id);
            setCopiedShopId(true);
            setTimeout(() => setCopiedShopId(false), 2000);
        }
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile');
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'Exact Location':
                navigation.navigate('LocationPicker');
                break;
            case 'Manage Inventory':
                navigation.navigate('Main', { screen: 'Inventory' });
                break;
            case 'Help':
                navigation.navigate('Help');
                break;
            case 'Contact':
                navigation.navigate('Support');
                break;
            case 'Notifications':
                navigation.navigate('Notifications');
                break;
            default:
                Alert.alert(action, 'This feature is coming soon!');
        }
    };

    const DetailRow = ({
        icon,
        label,
        value,
        onPress,
        isLink = false,
    }: {
        icon: string;
        label: string;
        value?: string;
        onPress?: () => void;
        isLink?: boolean;
    }) => (
        <TouchableOpacity
            style={styles.detailRow}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.detailLeft}>
                <Text style={styles.detailIcon}>{icon}</Text>
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <View style={styles.detailRight}>
                {value ? (
                    <Text style={styles.detailValue}>{value}</Text>
                ) : (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={onPress}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                )}
                {isLink && <Text style={styles.chevron}>›</Text>}
            </View>
        </TouchableOpacity>
    );

    const ActionRow = ({ icon, label, onPress, variant = 'default' }: {
        icon: string;
        label: string;
        onPress: () => void;
        variant?: 'default' | 'danger';
    }) => (
        <TouchableOpacity
            style={styles.actionRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.actionIcon}>{icon}</Text>
            <Text style={[
                styles.actionLabel,
                variant === 'danger' && styles.actionLabelDanger
            ]}>
                {label}
            </Text>
            <Text style={[
                styles.actionChevron,
                variant === 'danger' && styles.actionChevronDanger
            ]}>›</Text>
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Profile Header */}
            <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {shop?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.shopName}>{shop?.name || 'Shop Name'}</Text>
                        <View style={styles.profileMeta}>
                            <View style={styles.planBadge}>
                                <Text style={styles.planText}>Starter Plan</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>
                                    {shop?.status === 'ACTIVE' ? 'Active' : shop?.status || 'Pending'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditProfile}
                    activeOpacity={0.8}
                >
                    <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Business Details */}
            <SectionHeader title="BUSINESS DETAILS" />
            <View style={styles.card}>
                <DetailRow
                    icon="👤"
                    label="Owner Name"
                    value={shop?.ownerName}
                    onPress={handleEditProfile}
                    isLink
                />
                <DetailRow
                    icon="📞"
                    label="Phone"
                    value={shop?.phone}
                    onPress={handleEditProfile}
                    isLink
                />
                <DetailRow
                    icon="📍"
                    label="Locality"
                    value={shop?.locality}
                    onPress={handleEditProfile}
                    isLink
                />
                <DetailRow
                    icon="🏠"
                    label="Address"
                    value={shop?.address}
                    onPress={handleEditProfile}
                    isLink
                />
                <TouchableOpacity
                    style={[styles.detailRow, styles.locationRow]}
                    onPress={() => navigation.navigate('LocationPicker')}
                    activeOpacity={0.7}
                >
                    <View style={styles.detailLeft}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>Exact Location (GPS)</Text>
                            <Text style={styles.locationSubtext}>
                                {shop?.lat && shop?.lng
                                    ? `${shop.lat.toFixed(4)}, ${shop.lng.toFixed(4)}`
                                    : 'Required for customers'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.detailRight}>
                        {shop?.lat && shop?.lng ? (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓ Set</Text>
                            </View>
                        ) : (
                            <View style={styles.addButton}>
                                <Text style={styles.addButtonText}>Add Now</Text>
                            </View>
                        )}
                        <Text style={styles.chevron}>›</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Account Info */}
            <SectionHeader title="ACCOUNT" />
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.detailRow}
                    onPress={handleCopyShopId}
                    activeOpacity={0.7}
                >
                    <View style={styles.detailLeft}>
                        <Text style={styles.detailIcon}>🆔</Text>
                        <Text style={styles.detailLabel}>Shop ID</Text>
                    </View>
                    <View style={styles.detailRight}>
                        <Text style={styles.shopIdValue}>
                            {shop?.id?.slice(0, 8) || 'N/A'}...
                        </Text>
                        <View style={styles.copyIconContainer}>
                            <Text style={styles.copyIcon}>{copiedShopId ? '✓' : '📋'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {copiedShopId && (
                    <View style={styles.copiedToast}>
                        <Text style={styles.copiedToastText}>✓ Copied to clipboard</Text>
                    </View>
                )}
            </View>

            {/* Shop Management */}
            <SectionHeader title="SHOP" />
            <View style={styles.card}>
                <ActionRow
                    icon="🏪"
                    label="Manage Inventory"
                    onPress={() => handleQuickAction('Manage Inventory')}
                />
                <ActionRow
                    icon="📊"
                    label="Business Analytics"
                    onPress={() => handleQuickAction('Analytics')}
                />
                <ActionRow
                    icon="⚙️"
                    label="Shop Settings"
                    onPress={() => handleQuickAction('Settings')}
                />
            </View>

            {/* Billing */}
            <SectionHeader title="BILLING" />
            <View style={styles.card}>
                <ActionRow
                    icon="💳"
                    label="Subscription & Plans"
                    onPress={() => handleQuickAction('Subscription')}
                />
                <ActionRow
                    icon="💰"
                    label="Payment Methods"
                    onPress={() => handleQuickAction('Payment')}
                />
            </View>

            {/* Support */}
            <SectionHeader title="SUPPORT" />
            <View style={styles.card}>
                <ActionRow
                    icon="❓"
                    label="Help & FAQ"
                    onPress={() => handleQuickAction('Help')}
                />
                <ActionRow
                    icon="📧"
                    label="Contact Support"
                    onPress={() => handleQuickAction('Contact')}
                />
                <ActionRow
                    icon="🔔"
                    label="Notifications"
                    onPress={() => handleQuickAction('Notifications')}
                />
            </View>

            {/* Logout */}
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.logoutRow}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Text style={styles.logoutIcon}>🚪</Text>
                    <Text style={styles.logoutLabel}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Version */}
            <Text style={styles.version}>Fashcycle Shop App v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        padding: SPACING.lg,
        paddingBottom: 32,
    },

    // Profile Card
    profileCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.lg,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    profileInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    profileMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    planBadge: {
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 6,
    },
    planText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
    },
    statusText: {
        fontSize: 11,
        color: COLORS.success,
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },

    // Section Headers
    sectionTitle: {
        fontSize: 11,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: SPACING.sm,
        fontWeight: '600',
    },

    // Cards
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Detail Rows
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: SPACING.md,
    },
    detailIcon: {
        fontSize: 18,
    },
    detailLabel: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
    detailRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    detailValue: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    addButtonText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    chevron: {
        color: COLORS.textTertiary,
        fontSize: 24,
        fontWeight: '300',
    },

    // Location Row
    locationRow: {
        backgroundColor: 'rgba(29, 185, 84, 0.05)',
        borderBottomWidth: 0,
    },
    locationSubtext: {
        fontSize: 11,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 6,
    },
    verifiedText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '700',
    },

    // Shop ID Row
    shopIdValue: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontFamily: 'monospace',
    },
    copyIconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    copyIcon: {
        fontSize: 16,
    },
    copiedToast: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.primary,
    },
    copiedToastText: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Action Rows
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    actionIcon: {
        fontSize: 18,
        marginRight: SPACING.md,
    },
    actionLabel: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '500',
    },
    actionLabelDanger: {
        color: COLORS.error,
    },
    actionChevron: {
        color: COLORS.textTertiary,
        fontSize: 24,
        fontWeight: '300',
    },
    actionChevronDanger: {
        color: COLORS.error,
    },

    // Logout
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    logoutIcon: {
        fontSize: 18,
        marginRight: SPACING.md,
    },
    logoutLabel: {
        color: COLORS.error,
        fontSize: 15,
        fontWeight: '600',
    },

    // Version
    version: {
        color: COLORS.textTertiary,
        textAlign: 'center',
        fontSize: 11,
        paddingVertical: SPACING.xl,
    },
});
