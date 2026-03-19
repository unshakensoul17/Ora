import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '../../store/authStore';
import { getShopInventory, getShopBookings } from '../../api/endpoints';
import { InventoryItem, Booking } from '../../api/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';


const CATEGORIES = [
    { label: 'All', value: 'ALL' },
    { label: 'Lehenga', value: 'LEHENGA' },
    { label: 'Sherwani', value: 'SHERWANI' },
    { label: 'Saree', value: 'SAREE' },
    { label: 'Anarkali', value: 'ANARKALI' },
    { label: 'Indo-Western', value: 'INDO_WESTERN' },
    { label: 'Gown', value: 'GOWN' },
    { label: 'Suit', value: 'SUIT' },
    { label: 'Other', value: 'OTHER' },
];

interface CalendarDay {
    date: Date;
    bookings: Booking[];
}

export default function CalendarScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [hasItems, setHasItems] = useState<boolean | null>(null); // null = unknown, false = truly empty

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (shop?.id) {
            setLoading(true);
            loadBookings();
        }
    }, [shop?.id]);

    useEffect(() => {
        if (shop?.id) {
            loadInventory();
        }
    }, [shop?.id, debouncedSearch, selectedCategory]);

    useEffect(() => {
        if (selectedItem && allBookings) {
            generateCalendar();
        }
    }, [selectedItem, currentMonth, allBookings]);

    const loadBookings = async () => {
        if (!shop?.id) return;
        try {
            const bookingsData = await getShopBookings(shop.id);
            setAllBookings(bookingsData.bookings || []);
        } catch (err) {
            console.error('Failed to load bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadInventory = async () => {
        if (!shop?.id) return;
        try {
            const inventoryFilters: any = {};
            if (debouncedSearch.trim()) inventoryFilters.search = debouncedSearch.trim();
            if (selectedCategory !== 'ALL') inventoryFilters.category = selectedCategory;

            const inventoryData = await getShopInventory(shop.id, inventoryFilters);
            setItems(inventoryData.items);

            if (selectedCategory === 'ALL' && !debouncedSearch.trim()) {
                setHasItems(inventoryData.items.length > 0);
            } else if (inventoryData.items.length > 0) {
                setHasItems(true);
            }

            if (inventoryData.items.length > 0 && !selectedItem) {
                setSelectedItem(inventoryData.items[0]);
            }
        } catch (error) {
            console.error('Failed to load inventory:', error);
        }
    };

    const generateCalendar = () => {
        if (!selectedItem) return;

        console.log('Generating calendar for:', selectedItem.name, '(' + selectedItem.id + ')');
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        const calendarDays: CalendarDay[] = days.map(date => {
            // Find bookings for this item on this date
            const dayBookings = allBookings.filter(booking => {
                // Check if booking belongs to selected item
                // Use optional chaining and fallback to handle potential mapping differences
                const bookingItemId = booking.inventoryItem?.id || (booking as any).itemId;

                if (!bookingItemId || bookingItemId !== selectedItem.id) {
                    return false;
                }

                // Parse dates safely
                const bookingStart = typeof booking.startDate === 'string' ? parseISO(booking.startDate) : new Date(booking.startDate);
                const bookingEnd = typeof booking.endDate === 'string' ? parseISO(booking.endDate) : new Date(booking.endDate);

                // Comparison needs to be date-only (ignore time)
                const checkDateInfo = new Date(date).setHours(0, 0, 0, 0);
                const startDateInfo = new Date(bookingStart).setHours(0, 0, 0, 0);
                const endDateInfo = new Date(bookingEnd).setHours(0, 0, 0, 0);

                return checkDateInfo >= startDateInfo && checkDateInfo <= endDateInfo;
            });

            return {
                date,
                bookings: dayBookings,
            };
        });

        const bookedDays = calendarDays.filter(d => d.bookings.length > 0).length;
        console.log(`Found ${bookedDays} days with bookings in this month`);

        setCalendarData(calendarDays);
    };

    const getStatusColor = (bookings: Booking[], date?: Date) => {
        if (bookings.length === 0) {
            // If date is provided and is today or future, show green tint
            if (date && date.getTime() >= new Date().setHours(0, 0, 0, 0)) {
                return 'rgba(74, 222, 128, 0.1)';
            }
            return '#1a1a1a';
        }

        const hasRented = bookings.some(b => b.status === 'RENTED');
        const hasConfirmed = bookings.some(b => b.status === 'CONFIRMED');
        const hasHold = bookings.some(b => b.status === 'HOLD');

        if (hasRented) return '#dc2626';
        if (hasConfirmed) return '#3b82f6';
        if (hasHold) return '#eab308';
        return '#1a1a1a';
    };

    const getStatusBorder = (bookings: Booking[]) => {
        if (bookings.length === 0) return 'transparent';
        return getStatusColor(bookings);
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayPress = (day: CalendarDay) => {
        if (day.bookings.length > 0) {
            setSelectedDay(day);
        }
    };

    const formatDateSafe = (dateStr: string | Date) => {
        try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            return format(date, 'MMM d');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    if (hasItems === false) {
        return (
            <View style={[styles.container, styles.center]}>
                <Ionicons name="calendar-outline" size={48} color="#D4AF37" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>No items found</Text>
                <Text style={styles.emptySubtext}>Add items to see their availability</Text>
            </View>
        );
    }

    const firstDay = startOfMonth(currentMonth);
    // 0 = Sunday, 1 = Monday. 
    const startingDayOfWeek = firstDay.getDay();

    // Derive bookings for the selected item specifically for the current month
    const itemBookings = allBookings.filter(booking => {
        const bookingItemId = booking.inventoryItem?.id || (booking as any).itemId;
        if (bookingItemId !== selectedItem?.id) return false;

        const start = typeof booking.startDate === 'string' ? parseISO(booking.startDate) : new Date(booking.startDate);
        const end = typeof booking.endDate === 'string' ? parseISO(booking.endDate) : new Date(booking.endDate);

        // Show if either start or end falls in the current month
        return isSameMonth(start, currentMonth) || isSameMonth(end, currentMonth);
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const renderBookingItem = (booking: Booking) => (
        <View key={booking.id} style={styles.persistentBookingCard}>
            <View style={styles.bookingRow}>
                <View style={styles.bookingMainInfo}>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="person-outline" size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
                        <Text style={styles.bookingPatientName}>
                            {booking.user?.name || booking.customer?.name || 'Customer'}
                        </Text>
                    </View>
                    <View style={styles.iconTextRow}>
                        <Ionicons name="calendar-outline" size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
                        <Text style={styles.bookingDateRange}>
                            {formatDateSafe(booking.startDate)} - {formatDateSafe(booking.endDate)}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusTag, { backgroundColor: getStatusColor([booking]) + '33', borderColor: getStatusColor([booking]) }]}>
                    <Text style={[styles.statusTagText, { color: getStatusColor([booking]) }]}>
                        {booking.status}
                    </Text>
                </View>
            </View>
            <View style={styles.bookingFooter}>
                <View style={styles.iconTextRow}>
                    <Ionicons name="call-outline" size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
                    <Text style={styles.bookingPhone}>{booking.user?.phone || booking.customer?.phone || 'N/A'}</Text>
                </View>
                <Text style={styles.bookingPrice}>₹{((booking.totalAmount || 0) / 100).toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.itemSelector}
                    onPress={() => setShowItemPicker(true)}
                >
                    <Text style={styles.itemName} numberOfLines={1}>
                        {selectedItem?.name || 'Select Item'}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNav}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} />
                    <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
                    <Text style={styles.legendText}>Rented</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.legendText}>Confirmed</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
                    <Text style={styles.legendText}>Hold</Text>
                </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendar}>
                {/* Weekday headers */}
                <View style={styles.weekRow}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <Text key={day} style={styles.weekDay}>{day}</Text>
                    ))}
                </View>

                {/* Days grid */}
                <View style={styles.daysGrid}>
                    {/* Empty cells for starting day */}
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <View key={`empty-${i}`} style={styles.dayCell} />
                    ))}

                    {calendarData.map((day, index) => {
                        const hasBookings = day.bookings.length > 0;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayCell,
                                    {
                                        backgroundColor: getStatusColor(day.bookings, day.date),
                                        borderColor: getStatusBorder(day.bookings),
                                        borderWidth: hasBookings ? 2 : 0,
                                    },
                                    !hasBookings && styles.dayCellAvailable,
                                ]}
                                onPress={() => handleDayPress(day)}
                                disabled={!hasBookings}
                            >
                                <Text style={[
                                    styles.dayText,
                                    hasBookings && { color: '#fff', fontWeight: '600' },
                                    // Make available days text whiteish/greenish too
                                    !hasBookings && day.date.getTime() >= new Date().setHours(0, 0, 0, 0) && { color: '#4ade80' }
                                ]}>
                                    {format(day.date, 'd')}
                                </Text>
                                {hasBookings && (
                                    <View style={styles.bookingDot} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Persistent Bookings List */}
            <View style={styles.bookingsListSection}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitle}>Bookings in {format(currentMonth, 'MMMM')}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{itemBookings.length}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.allBookingsBtn}
                        onPress={() => navigation.navigate('ItemBookings', {
                            itemId: selectedItem?.id,
                            itemName: selectedItem?.name
                        })}
                    >
                        <Text style={styles.allBookingsBtnText}>All Bookings ›</Text>
                    </TouchableOpacity>
                </View>

                {itemBookings.length > 0 ? (
                    itemBookings.map(renderBookingItem)
                ) : (
                    <View style={styles.noBookingsCard}>
                        <Text style={styles.noBookingsText}>No bookings found for this item</Text>
                    </View>
                )}
            </View>

            <View style={{ height: 100 }} />


            {/* Item Picker Modal */}
            <Modal
                visible={showItemPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowItemPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Item</Text>
                            <TouchableOpacity onPress={() => setShowItemPicker(false)}>
                                <Ionicons name="close" size={24} color="#A1A1AA" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterSection}>
                            <View style={styles.searchContainer}>
                                <Text style={styles.searchIcon}>🔍</Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search products..."
                                    placeholderTextColor="#666"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    clearButtonMode="while-editing"
                                />
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryList}
                            >
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        style={[
                                            styles.categoryTab,
                                            selectedCategory === cat.value && styles.activeCategoryTab
                                        ]}
                                        onPress={() => setSelectedCategory(cat.value)}
                                    >
                                        <Text style={[
                                            styles.categoryLabel,
                                            selectedCategory === cat.value && styles.activeCategoryLabel
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.modalList}
                            ListEmptyComponent={
                                <View style={styles.modalEmpty}>
                                    <Text style={styles.emptyText}>No items found</Text>
                                </View>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.itemOption,
                                        selectedItem?.id === item.id && styles.itemOptionSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedItem(item);
                                        setShowItemPicker(false);
                                    }}
                                >
                                    <View style={styles.itemThumbnailContainer}>
                                        {item.images && item.images.length > 0 ? (
                                            <Image
                                                source={{
                                                    uri: item.images[0].startsWith('http')
                                                        ? item.images[0]
                                                        : `https://zkmkapeuqbyvjxdkiljx.supabase.co/storage/v1/object/public/inventory-images/${item.images[0]}`
                                                }}
                                                style={styles.thumbnail}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                            />
                                        ) : (
                                            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                                                <Text style={styles.placeholderText}>No Image</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemOptionText}>{item.name}</Text>
                                        <Text style={styles.itemOptionCategory}>{item.category} • Size {item.size}</Text>
                                    </View>
                                    {selectedItem?.id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#4ade80" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Booking Details Modal */}
            <Modal
                visible={!!selectedDay}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedDay(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedDay && format(selectedDay.date, 'MMM d, yyyy')}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedDay(null)} style={styles.modalCloseButton}>
                                <Ionicons name="close" size={24} color="#A1A1AA" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {selectedDay?.bookings.map((booking, index) => (
                                <View key={index} style={styles.bookingCard}>
                                    <View style={styles.bookingHeader}>
                                        <Text style={styles.bookingStatus}>{booking.status}</Text>
                                    </View>
                                    <Text style={styles.bookingCustomer}>Booking #{booking.id.slice(0, 8)}</Text>

                                    {/* User/Customer Details */}
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Name:</Text>
                                        <Text style={styles.detailValue}>
                                            {booking.user?.name || booking.customer?.name || 'Unknown User'}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Phone:</Text>
                                        <Text style={styles.detailValue}>
                                            {booking.user?.phone || booking.customer?.phone || 'N/A'}
                                        </Text>
                                    </View>

                                    {/* Item Details */}
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Item:</Text>
                                        <Text style={styles.detailValue}>
                                            {booking.item?.name || 'Unknown Item'}
                                        </Text>
                                    </View>

                                    {booking.item?.images?.[0] && (
                                        <Image
                                            source={{ uri: booking.item.images[0] }}
                                            style={styles.itemThumbnail}
                                            resizeMode="cover"
                                        />
                                    )}

                                    <Text style={styles.bookingDates}>
                                        {formatDateSafe(booking.startDate)} - {formatDateSafe(booking.endDate)}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalCloseButton: {
        padding: 4,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    itemSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    dropdownIcon: {
        color: '#D4AF37',
        fontSize: 12,
        marginLeft: 8,
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonText: {
        color: '#D4AF37',
        fontSize: 24,
        fontWeight: 'bold',
    },
    monthText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        color: '#888',
        fontSize: 11,
    },
    calendar: {
        padding: 16,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 4,
        position: 'relative',
    },
    dayCellAvailable: {
        backgroundColor: '#1a1a1a',
    },
    dayText: {
        color: '#888',
        fontSize: 14,
    },
    bookingDot: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
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
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalClose: {
        fontSize: 24,
        color: '#888',
    },
    filterSection: {
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    categoryList: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    activeCategoryTab: {
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderColor: '#D4AF37',
    },
    categoryLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
    },
    activeCategoryLabel: {
        color: '#D4AF37',
        fontWeight: '600',
    },
    modalList: {
        paddingBottom: 20,
    },
    modalEmpty: {
        padding: 40,
        alignItems: 'center',
    },
    itemOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: '#222',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    itemOptionSelected: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    itemThumbnailContainer: {
        marginRight: 12,
    },
    thumbnail: {
        width: 40,
        height: 50,
        borderRadius: 6,
        backgroundColor: '#333',
    },
    placeholderThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#666',
        fontSize: 8,
        textAlign: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemOptionText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    itemOptionCategory: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    checkIcon: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    bookingCard: {
        padding: 16,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        margin: 16,
    },
    bookingHeader: {
        marginBottom: 8,
    },
    bookingStatus: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    bookingCustomer: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    bookingDates: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    detailLabel: {
        color: '#888',
        width: 60,
        fontSize: 14,
    },
    detailValue: {
        color: '#fff',
        flex: 1,
        fontSize: 14,
    },
    itemThumbnail: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginTop: 8,
        backgroundColor: '#333',
    },
    bookingsListSection: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginRight: 8,
    },
    allBookingsBtn: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    allBookingsBtnText: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: '#121212',
        fontSize: 12,
        fontWeight: 'bold',
    },
    persistentBookingCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    bookingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bookingMainInfo: {
        flex: 1,
    },
    bookingPatientName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    bookingDateRange: {
        color: '#aaa',
        fontSize: 14,
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    bookingPhone: {
        color: '#888',
        fontSize: 13,
    },
    bookingPrice: {
        color: '#D4AF37',
        fontSize: 15,
        fontWeight: 'bold',
    },
    noBookingsCard: {
        backgroundColor: '#1a1a1a',
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#333',
    },
    noBookingsText: {
        color: '#666',
        fontSize: 14,
    },
});
