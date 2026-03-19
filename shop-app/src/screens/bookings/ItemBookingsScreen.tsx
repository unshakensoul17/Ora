import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getShopBookings } from '../../api/endpoints';
import { Booking } from '../../api/types';
import { parseISO, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';


const STATUS_FILTERS = [
    { label: 'All', value: 'ALL' },
    { label: 'Hold', value: 'HOLD' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

export default function ItemBookingsScreen({ route, navigation }: any) {
    const { itemId, itemName } = route.params;
    const shop = useAuthStore((state) => state.shop);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    useEffect(() => {
        loadBookings();
    }, [shop?.id, itemId]);

    const loadBookings = async () => {
        if (!shop?.id || !itemId) return;
        try {
            setLoading(true);
            const data = await getShopBookings(shop.id);
            // Filter by item ID
            const itemSpecific = (data.bookings || []).filter(b => {
                const bItemId = b.inventoryItem?.id || (b as any).itemId;
                return bItemId === itemId;
            });

            setBookings(itemSpecific.sort((a, b) =>
                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            ));
        } catch (error) {
            console.error('Failed to load item bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b =>
        selectedStatus === 'ALL' || b.status === selectedStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HOLD': return '#eab308';
            case 'CONFIRMED': return '#3b82f6';
            case 'ACTIVE': return '#10b981';
            case 'COMPLETED': return '#6366f1';
            case 'CANCELLED': return '#ef4444';
            default: return '#888';
        }
    };

    const formatDate = (dateStr: string | Date) => {
        try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            return format(date, 'MMM d, yyyy');
        } catch (e) {
            return 'N/A';
        }
    };

    const renderBookingItem = ({ item }: { item: Booking }) => (
        <View style={styles.bookingCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="person-outline" size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
                        <Text style={styles.userName}>{item.user?.name || item.customer?.name || 'Customer'}</Text>
                    </View>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="call-outline" size={13} color="#D4AF37" style={{ marginRight: 6 }} />
                        <Text style={styles.userPhone}>{item.user?.phone || item.customer?.phone || 'N/A'}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22', borderColor: getStatusColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.dateSection}>
                <View style={styles.dateBlock}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
                </View>
                <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
                    <Text style={styles.dateLabel}>End Date</Text>
                    <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.bookingId}>ID: {item.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.price}>₹{((item.totalAmount || 0) / 100).toLocaleString()}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{itemName}</Text>
                <Text style={styles.subtitle}>Full Booking History</Text>
            </View>

            <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {STATUS_FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[
                                styles.filterTab,
                                selectedStatus === filter.value && styles.activeFilterTab
                            ]}
                            onPress={() => setSelectedStatus(filter.value)}
                        >
                            <Text style={[
                                styles.filterLabel,
                                selectedStatus === filter.value && styles.activeFilterLabel
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredBookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color="#D4AF37" style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyText}>No bookings found</Text>
                        <Text style={styles.emptySubtext}>Try a different status filter</Text>
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
    centerContainer: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
    },
    filterBar: {
        paddingVertical: 12,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    filterContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeFilterTab: {
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderColor: '#D4AF37',
    },
    filterLabel: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
    },
    activeFilterLabel: {
        color: '#D4AF37',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    bookingCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    userPhone: {
        color: '#aaa',
        fontSize: 13,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#2a2a2a',
        marginVertical: 12,
    },
    dateSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dateBlock: {
        flex: 1,
    },
    dateLabel: {
        color: '#666',
        fontSize: 11,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    dateValue: {
        color: '#eee',
        fontSize: 14,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    bookingId: {
        color: '#444',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    price: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptySubtext: {
        color: '#666',
        fontSize: 14,
        marginTop: 4,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
});
