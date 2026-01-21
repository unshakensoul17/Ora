import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useFocusEffect } from '@react-navigation/native';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '../../api/support-notifications';

const COLORS = {
    background: '#0B0F0D',
    card: '#101814',
    border: '#1F2A23',
    primary: '#1DB954',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 32,
};

// Helper function to format timestamp
function formatTimestamp(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}

export default function NotificationsScreen() {
    const shop = useAuthStore((state) => state.shop);

    // Preferences state
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [newHolds, setNewHolds] = useState(true);
    const [pickups, setPickups] = useState(true);
    const [returns, setReturns] = useState(true);
    const [marketing, setMarketing] = useState(false);

    // UI state
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [updating, setUpdating] = useState(false);

    // Load preferences and notifications
    const loadData = async () => {
        if (!shop?.id) return;

        try {
            // Load preferences
            const prefs = await getNotificationPreferences(shop.id);
            setPushEnabled(prefs.pushEnabled ?? true);
            setEmailEnabled(prefs.emailEnabled ?? true);
            setSmsEnabled(prefs.smsEnabled ?? false);
            setNewHolds(prefs.newHolds ?? true);
            setPickups(prefs.pickups ?? true);
            setReturns(prefs.returns ?? true);
            setMarketing(prefs.marketing ?? false);

            // Load notifications
            const notifs = await getNotifications(shop.id, 50);
            setNotifications(notifs);
        } catch (error) {
            console.error('Failed to load notifications data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [shop?.id]);

    // Reload on screen focus
    useFocusEffect(
        useCallback(() => {
            if (shop?.id) {
                loadData();
            }
        }, [shop?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Update preferences
    const updatePreference = async (key: string, value: boolean) => {
        if (!shop?.id) return;

        setUpdating(true);
        try {
            await updateNotificationPreferences(shop.id, { [key]: value });
        } catch (error) {
            console.error('Failed to update preference:', error);
            // Revert on error
            loadData();
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        if (!shop?.id) return;

        try {
            await markNotificationAsRead(notificationId, shop.id);
            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!shop?.id) return;

        try {
            await markAllNotificationsAsRead(shop.id);
            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const NotificationRow = ({
        label,
        subtitle,
        value,
        onValueChange,
        preferenceKey,
    }: {
        label: string;
        subtitle?: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
        preferenceKey: string;
    }) => {
        const handleToggle = async (newValue: boolean) => {
            onValueChange(newValue);
            await updatePreference(preferenceKey, newValue);
        };

        return (
            <View style={styles.notificationRow}>
                <View style={styles.notificationInfo}>
                    <Text style={styles.notificationLabel}>{label}</Text>
                    {subtitle && <Text style={styles.notificationSubtitle}>{subtitle}</Text>}
                </View>
                <Switch
                    value={value}
                    onValueChange={handleToggle}
                    trackColor={{ false: '#374151', true: COLORS.primary }}
                    thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
                    disabled={updating}
                />
            </View>
        );
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={COLORS.primary}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.subtitle}>Manage how you receive updates</Text>
            </View>

            {/* Notification Channels */}
            <Text style={styles.sectionTitle}>NOTIFICATION CHANNELS</Text>
            <View style={styles.card}>
                <NotificationRow
                    label="Push Notifications"
                    subtitle="Receive instant alerts on your device"
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                    preferenceKey="pushEnabled"
                />
                <NotificationRow
                    label="Email Notifications"
                    subtitle="Get updates via email"
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                    preferenceKey="emailEnabled"
                />
                <NotificationRow
                    label="SMS Notifications"
                    subtitle="Receive text messages for important updates"
                    value={smsEnabled}
                    onValueChange={setSmsEnabled}
                    preferenceKey="smsEnabled"
                />
            </View>

            {/* Notification Types */}
            <Text style={styles.sectionTitle}>WHAT TO NOTIFY</Text>
            <View style={styles.card}>
                <NotificationRow
                    label="New Holds"
                    subtitle="When a customer creates a new hold"
                    value={newHolds}
                    onValueChange={setNewHolds}
                    preferenceKey="newHolds"
                />
                <NotificationRow
                    label="Pickup Reminders"
                    subtitle="When items are ready for pickup"
                    value={pickups}
                    onValueChange={setPickups}
                    preferenceKey="pickups"
                />
                <NotificationRow
                    label="Return Reminders"
                    subtitle="When items are due for return"
                    value={returns}
                    onValueChange={setReturns}
                    preferenceKey="returns"
                />
                <NotificationRow
                    label="Marketing & Updates"
                    subtitle="New features, tips, and promotions"
                    value={marketing}
                    onValueChange={setMarketing}
                    preferenceKey="marketing"
                />
            </View>

            {/* Recent Notifications */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT NOTIFICATIONS</Text>
                {notifications.some(n => !n.isRead) && (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={styles.markAllRead}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.card}>
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No notifications yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            You'll see updates about holds, pickups, and returns here
                        </Text>
                    </View>
                ) : (
                    notifications.map((notification, index) => (
                        <TouchableOpacity
                            key={notification.id}
                            style={[
                                styles.notificationItem,
                                notification.isRead && styles.notificationItemRead,
                                index === notifications.length - 1 && styles.notificationItemLast,
                            ]}
                            onPress={() => !notification.isRead && handleMarkAsRead(notification.id)}
                            activeOpacity={notification.isRead ? 1 : 0.7}
                        >
                            <View style={[
                                styles.notificationDot,
                                notification.isRead && styles.notificationDotRead
                            ]} />
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationItemTitle}>{notification.title}</Text>
                                <Text style={styles.notificationItemText}>
                                    {notification.message}
                                </Text>
                                <Text style={styles.notificationTime}>
                                    {formatTimestamp(notification.createdAt)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                    Enable notifications to stay updated on bookings, pickups, and returns in real-time.
                </Text>
            </View>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    sectionTitle: {
        fontSize: 11,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: SPACING.sm,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    markAllRead: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    notificationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    notificationInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    notificationLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    notificationSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: 'rgba(29, 185, 84, 0.05)',
    },
    notificationItemRead: {
        backgroundColor: 'transparent',
    },
    notificationItemLast: {
        borderBottomWidth: 0,
    },
    emptyState: {
        paddingVertical: SPACING.xxl,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    emptyStateSubtext: {
        fontSize: 13,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
    notificationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginRight: SPACING.md,
        marginTop: 6,
    },
    notificationDotRead: {
        backgroundColor: COLORS.textTertiary,
    },
    notificationContent: {
        flex: 1,
    },
    notificationItemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    notificationItemText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        borderRadius: 12,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(29, 185, 84, 0.3)',
        gap: SPACING.md,
    },
    infoIcon: {
        fontSize: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
});
