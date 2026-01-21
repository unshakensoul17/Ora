import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getShopInventory, getShopBookings } from '../../api/endpoints';
import { InventoryItem, Booking } from '../../api/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';

interface CalendarDay {
    date: Date;
    bookings: Booking[];
}

export default function CalendarScreen() {
    const shop = useAuthStore((state) => state.shop);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
    const [showItemPicker, setShowItemPicker] = useState(false);

    useEffect(() => {
        loadData();
    }, [shop?.id]);

    useEffect(() => {
        if (selectedItem && allBookings) {
            generateCalendar();
        }
    }, [selectedItem, currentMonth, allBookings]);

    const loadData = async () => {
        if (!shop?.id) return;
        try {
            console.log('Loading calendar data for shop:', shop.id);
            const [inventoryData, bookingsData] = await Promise.all([
                getShopInventory(shop.id),
                getShopBookings(shop.id),
            ]);

            console.log('Items loaded:', inventoryData.items.length);
            console.log('Bookings loaded:', bookingsData.bookings?.length);

            setItems(inventoryData.items);
            setAllBookings(bookingsData.bookings || []);

            if (inventoryData.items.length > 0) {
                setSelectedItem(inventoryData.items[0]);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
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
            if (date && date >= new Date().setHours(0, 0, 0, 0)) {
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

    if (items.length === 0) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>No items to show</Text>
                <Text style={styles.emptySubtext}>Add items to see their availability</Text>
            </View>
        );
    }

    const firstDay = startOfMonth(currentMonth);
    // 0 = Sunday, 1 = Monday. 
    const startingDayOfWeek = firstDay.getDay();

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
                                    !hasBookings && day.date >= new Date().setHours(0, 0, 0, 0) && { color: '#4ade80' }
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
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {items.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.itemOption,
                                        selectedItem?.id === item.id && styles.itemOptionSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedItem(item);
                                        setShowItemPicker(false);
                                    }}
                                >
                                    <Text style={styles.itemOptionText}>{item.name}</Text>
                                    <Text style={styles.itemOptionCategory}>{item.category}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
                            <TouchableOpacity onPress={() => setSelectedDay(null)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {selectedDay?.bookings.map((booking, index) => (
                                <View key={index} style={styles.bookingCard}>
                                    <View style={styles.bookingHeader}>
                                        <Text style={styles.bookingStatus}>{booking.status}</Text>
                                    </View>
                                    <Text style={styles.bookingCustomer}>Booking #{booking.id.slice(0, 8)}</Text>
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
    itemOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    itemOptionSelected: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderLeftWidth: 3,
        borderLeftColor: '#D4AF37',
    },
    itemOptionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    itemOptionCategory: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
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
    },
});
