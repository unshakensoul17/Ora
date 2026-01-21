import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import {
    getShopPendingHolds,
    getShopActiveRentals,
    getShopBookingHistory,
    markPickedUp,
    markReturned,
} from '../../api/endpoints';
import { Booking } from '../../api/types';

type TabType = 'pending' | 'active' | 'history';

export default function BookingsScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadBookings = useCallback(async () => {
        if (!shop?.id) return;

        try {
            setLoading(true);
            let data: any;

            switch (activeTab) {
                case 'pending':
                    data = await getShopPendingHolds(shop.id);
                    break;
                case 'active':
                    data = await getShopActiveRentals(shop.id);
                    break;
                case 'history':
                    const response = await getShopBookingHistory(shop.id, 1, 20);
                    data = response.bookings || response;
                    break;
            }

            setBookings(Array.isArray(data) ? data : []);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load bookings');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [shop?.id, activeTab]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const handleMarkPickup = async (bookingId: string) => {
        setActionLoading(bookingId);
        try {
            await markPickedUp(bookingId);
            Alert.alert('Success', 'Item marked as picked up!');
            loadBookings();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to mark as picked up');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkReturn = async (bookingId: string) => {
        Alert.alert(
            'Confirm Return',
            'Mark this item as returned?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setActionLoading(bookingId);
                        try {
                            await markReturned(bookingId);
                            Alert.alert('Success', 'Item marked as returned!');
                            loadBookings();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to mark as returned');
                        } finally {
                            setActionLoading(null);
                        }
                    },
                },
            ]
        );
    };

    const renderBookingCard = ({ item }: { item: Booking }) => {
        const isProcessing = actionLoading === item.id;

        return (
            <View style={styles.bookingCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.customerName}>👤 {item.user?.name || 'Customer'}</Text>
                        <Text style={styles.customerPhone}>{item.user?.phone}</Text>
                    </View>
                    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                {/* Item Details */}
                <View style={styles.itemSection}>
                    <Text style={styles.itemName}>📦 {item.item?.name || 'Item'}</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dates:</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Price:</Text>
                        <Text style={styles.priceValue}>
                            ₹{((item.platformPrice || 0) / 100).toLocaleString('en-IN')}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                {activeTab === 'pending' && (
                    <TouchableOpacity
                        style={[styles.actionButton, isProcessing && styles.buttonDisabled]}
                        onPress={() => handleMarkPickup(item.id)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#022b1e" size="small" />
                        ) : (
                            <Text style={styles.actionButtonText}>✓ Mark Picked Up</Text>
                        )}
                    </TouchableOpacity>
                )}

                {activeTab === 'active' && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.returnButton, isProcessing && styles.buttonDisabled]}
                        onPress={() => handleMarkReturn(item.id)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={[styles.actionButtonText, styles.returnButtonText]}>
                                ✓ Mark Returned
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
                {activeTab === 'pending' ? '📋' : activeTab === 'active' ? '👜' : '📚'}
            </Text>
            <Text style={styles.emptyTitle}>
                {activeTab === 'pending'
                    ? 'No Pending Pickups'
                    : activeTab === 'active'
                        ? 'No Active Rentals'
                        : 'No History'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'pending'
                    ? 'Bookings awaiting pickup will appear here'
                    : activeTab === 'active'
                        ? 'Currently rented items will appear here'
                        : 'Completed bookings will appear here'}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                        Pending
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Active
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                        History
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBookingCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#D4AF37"
                        />
                    }
                />
            )}
        </View>
    );
}

// Helper functions
function formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getStatusStyle(status: string) {
    switch (status) {
        case 'HOLD':
        case 'CONFIRMED':
            return { backgroundColor: 'rgba(251, 191, 36, 0.2)', borderColor: 'rgba(251, 191, 36, 0.5)' };
        case 'ACTIVE':
            return { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)' };
        case 'COMPLETED':
            return { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.5)' };
        case 'CANCELLED':
            return { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)' };
        default:
            return { backgroundColor: 'rgba(107, 114, 128, 0.2)', borderColor: 'rgba(107, 114, 128, 0.5)' };
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#D4AF37',
    },
    tabText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#D4AF37',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    bookingCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    customerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    customerPhone: {
        color: '#888',
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    itemSection: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    itemName: {
        color: '#D4AF37',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    detailLabel: {
        color: '#888',
        fontSize: 14,
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
    },
    priceValue: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
    },
    actionButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    returnButton: {
        backgroundColor: '#2a2a2a',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    actionButtonText: {
        color: '#022b1e',
        fontSize: 14,
        fontWeight: '600',
    },
    returnButtonText: {
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
