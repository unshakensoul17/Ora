import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getShopHolds, markPickedUp, markReturned, cancelBooking } from '../../api/endpoints';
import { Booking } from '../../api/types';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HoldsListScreen() {
    const shop = useAuthStore((state) => state.shop);
    const [holds, setHolds] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const navigation = useNavigation();

    const loadHolds = async () => {
        if (!shop?.id) return;
        try {
            const data = await getShopHolds(shop.id);
            setHolds(data);
        } catch (error) {
            console.error('Failed to load holds:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadHolds();
        }, [shop?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadHolds();
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handlePickup = async (bookingId: string) => {
        setActionLoading(bookingId);
        try {
            await markPickedUp(bookingId);
            Alert.alert('Success', 'Item marked as picked up');
            loadHolds();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReturn = async (bookingId: string) => {
        setActionLoading(bookingId);
        try {
            await markReturned(bookingId);
            Alert.alert('Success', 'Item marked as returned');
            loadHolds();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(bookingId);
                        try {
                            await cancelBooking(bookingId, 'Shop cancelled');
                            loadHolds();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel booking');
                        } finally {
                            setActionLoading(null);
                        }
                    },
                },
            ]
        );
    };

    const formatDateSafe = (dateString: string) => {
        try {
            return format(parseISO(dateString), 'MMM d');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatDates = (start: string, end: string) => {
        if (!start || !end) return 'Dates TBD';
        return `${formatDateSafe(start)} - ${formatDateSafe(end)}`;
    };

    const getTimeRemaining = (expiresAt: string) => {
        try {
            return formatDistanceToNow(parseISO(expiresAt), { addSuffix: true });
        } catch (e) {
            return '';
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            HOLD: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' },
            CONFIRMED: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
            RENTED: { bg: 'rgba(220, 38, 38, 0.2)', text: '#dc2626' },
            RETURNED: { bg: 'rgba(74, 222, 128, 0.2)', text: '#4ade80' },
            CANCELLED: { bg: 'rgba(107, 114, 128, 0.2)', text: '#9ca3af' },
        };
        return colors[status] || colors.HOLD;
    };

    const renderHold = ({ item }: { item: Booking }) => {
        const statusColor = getStatusColor(item.status);
        const isLoading = actionLoading === item.id;

        return (
            <View style={styles.holdCard}>
                <View style={styles.holdHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
                    </View>
                    {item.holdExpiresAt && item.status === 'HOLD' && (
                        <View style={styles.timerBadge}>
                            <View style={styles.iconTextRow}>
                                <Ionicons name="time-outline" size={14} color="#eab308" style={{ marginRight: 4 }} />
                                <Text style={styles.timerText}>{getTimeRemaining(item.holdExpiresAt)}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <Text style={styles.itemName}>{item.inventoryItem?.name || 'Unknown Item'}</Text>
                <Text style={styles.dates}>{formatDates(item.startDate, item.endDate)}</Text>

                <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{item.user?.name || 'Unknown Customer'}</Text>
                    <Text style={styles.customerPhone}>{item.user?.phone}</Text>
                </View>

                {isLoading ? (
                    <ActivityIndicator color="#D4AF37" style={{ marginTop: 12 }} />
                ) : (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleCall(item.user?.phone || '')}
                        >
                            <View style={styles.actionButtonContent}>
                                <Ionicons name="call-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={styles.actionText}>Call</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Allow pickup for both HOLD and CONFIRMED items */}
                        {(item.status === 'HOLD' || item.status === 'CONFIRMED') && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionButtonPrimary]}
                                onPress={() => handlePickup(item.id)}
                            >
                                <View style={styles.actionButtonContent}>
                                    <Ionicons name="checkmark" size={18} color="#000" style={{ marginRight: 6 }} />
                                    <Text style={styles.actionTextPrimary}>Pickup</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {item.status === 'HOLD' && (
                            <TouchableOpacity
                                style={styles.actionButtonSmall}
                                onPress={() => handleCancel(item.id)}
                            >
                                <Ionicons name="close" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        )}

                        {item.status === 'RENTED' && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionButtonPrimary]}
                                onPress={() => handleReturn(item.id)}
                            >
                                <View style={styles.actionButtonContent}>
                                    <Ionicons name="return-down-back" size={18} color="#000" style={{ marginRight: 6 }} />
                                    <Text style={styles.actionTextPrimary}>Return</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bookings</Text>
                <Text style={styles.count}>{holds.length} total</Text>
            </View>

            <FlatList
                data={holds}
                keyExtractor={(item) => item.id}
                renderItem={renderHold}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="clipboard-outline" size={48} color="#D4AF37" style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyText}>No bookings yet</Text>
                        <Text style={styles.emptySubtext}>When customers reserve items, they'll appear here</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#022b1e',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D4AF37',
    },
    count: {
        color: '#888',
        fontSize: 14,
    },
    list: {
        padding: 16,
    },
    holdCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    holdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timerBadge: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timerText: {
        color: '#eab308',
        fontSize: 12,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    dates: {
        color: '#D4AF37',
        fontSize: 14,
        marginBottom: 12,
    },
    customerInfo: {
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 12,
        marginBottom: 16,
    },
    customerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    customerPhone: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        height: 44,
        backgroundColor: '#333',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    actionButtonPrimary: {
        backgroundColor: '#D4AF37',
    },
    actionButtonSmall: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
    },
    actionTextPrimary: {
        color: '#000',
        fontWeight: 'bold',
    },
    cancelText: {
        color: '#ef4444',
        fontSize: 20,
        fontWeight: 'bold',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
