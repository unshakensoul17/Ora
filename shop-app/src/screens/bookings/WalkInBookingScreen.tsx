import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
    Dimensions,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import {
    getShopInventory,
    createWalkInBooking,
} from '../../api/endpoints';
import { InventoryItem } from '../../api/types';
import {
    format,
    addDays,
    differenceInDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    isBefore,
} from 'date-fns';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

type DiscountType = 'PERCENT' | 'AMOUNT';

export default function WalkInBookingScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // Dates
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(addDays(new Date(), 2));
    const [showCalendar, setShowCalendar] = useState<'START' | 'END' | null>(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // Customer
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');

    // Discount
    const [discountType, setDiscountType] = useState<DiscountType>('AMOUNT');
    const [discountValue, setDiscountValue] = useState('');

    // Payment
    const [paymentAmount, setPaymentAmount] = useState('');

    // UI State
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        if (!shop?.id) return;
        try {
            const data = await getShopInventory(shop.id, 1, 100);
            setItems(data.items.filter(item => item.status === 'ACTIVE'));
        } catch (error) {
            console.error('Failed to load inventory:', error);
        }
    };

    // Calculations
    const daysCount = Math.max(1, differenceInDays(endDate, startDate) + 1);
    const originalRentalPrice = selectedItem ? (selectedItem.rentalPrice * daysCount) : 0;

    let discountInPaise = 0;
    if (discountValue && selectedItem) {
        const val = parseFloat(discountValue);
        if (!isNaN(val)) {
            if (discountType === 'PERCENT') {
                discountInPaise = Math.round((originalRentalPrice * val) / 100);
            } else {
                discountInPaise = val * 100; // Rs to Paise
            }
        }
    }

    const finalRentalPrice = Math.max(0, originalRentalPrice - discountInPaise);
    const securityDeposit = selectedItem?.securityDeposit || 0;
    const grandTotal = finalRentalPrice + securityDeposit;

    const handleCreateBooking = async () => {
        if (!selectedItem || !customerName || !customerPhone || !startDate || !endDate) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (!shop?.id) return;

        setLoading(true);
        try {
            await createWalkInBooking({
                itemId: selectedItem.id,
                shopId: shop.id,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                customerName,
                customerPhone,
                customerAddress: customerAddress || undefined,
                discountAmount: discountInPaise,
                depositAmount: securityDeposit,
                paymentAmount: paymentAmount ? parseFloat(paymentAmount) * 100 : 0,
            });

            Alert.alert('Success', 'Walk-in booking created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date: Date) => {
        if (showCalendar === 'START') {
            setStartDate(date);
            if (isBefore(endDate, date)) {
                setEndDate(addDays(date, 1));
            }
        } else {
            if (isBefore(date, startDate)) {
                Alert.alert('Invalid Date', 'End date cannot be before start date');
                return;
            }
            setEndDate(date);
        }
        setShowCalendar(null);
    };

    const renderCalendar = () => {
        const start = startOfMonth(calendarMonth);
        const end = endOfMonth(calendarMonth);
        const days = eachDayOfInterval({ start, end });
        const startDay = start.getDay();
        const blanks = Array(startDay).fill(null);

        return (
            <Modal visible={!!showCalendar} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarContainer}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                                <Typography style={styles.calendarNav}>‹</Typography>
                            </TouchableOpacity>
                            <Typography variant="h3" style={styles.calendarMonthName}>{format(calendarMonth, 'MMMM yyyy')}</Typography>
                            <TouchableOpacity onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                                <Typography style={styles.calendarNav}>›</Typography>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekRow}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <Typography key={d} variant="caption" style={styles.weekDayText}>{d}</Typography>
                            ))}
                        </View>

                        <View style={styles.daysGrid}>
                            {blanks.map((_, i) => <View key={`b-${i}`} style={styles.dayCell} />)}
                            {days.map(d => {
                                const isSelected = isSameDay(d, showCalendar === 'START' ? startDate : endDate);
                                const isToday = isSameDay(d, new Date());
                                const disabled = showCalendar === 'END' && isBefore(d, startDate);

                                return (
                                    <TouchableOpacity
                                        key={d.toISOString()}
                                        style={[
                                            styles.dayCell,
                                            isSelected && styles.selectedDay,
                                            disabled && styles.disabledDay
                                        ]}
                                        onPress={() => !disabled && handleDateSelect(d)}
                                        disabled={disabled}
                                    >
                                        <Typography style={[
                                            styles.dayText,
                                            isSelected && styles.selectedDayText,
                                            isToday && !isSelected && { color: COLORS.primary },
                                            disabled && styles.disabledDayText
                                        ]}>
                                            {format(d, 'd')}
                                        </Typography>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Button title="Cancel" onPress={() => setShowCalendar(null)} variant="ghost" style={{ marginTop: SPACING.m }} />
                    </View>
                </View>
            </Modal>
        );
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScreenWrapper>
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                <Typography variant="body" style={styles.sectionTitle}>Item Details</Typography>
                <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowItemPicker(true)}
                >
                    <Typography style={styles.pickerButtonText}>
                        {selectedItem ? selectedItem.name : 'Select Item'}
                    </Typography>
                    <Typography style={styles.pickerButtonIcon}>▾</Typography>
                </TouchableOpacity>

                {selectedItem && (
                    <View style={styles.itemSummary}>
                        <Typography variant="caption" style={styles.itemSummaryText}>
                            Base Price: ₹{(selectedItem.rentalPrice / 100).toLocaleString('en-IN')}/day
                        </Typography>
                        <Typography variant="caption" bold style={styles.itemSummaryHighlight}>
                            Available Size: {selectedItem.size}
                        </Typography>
                    </View>
                )}

                <Typography variant="body" style={styles.sectionTitle}>Rental Period</Typography>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.flex1, styles.dateInput]}
                        onPress={() => setShowCalendar('START')}
                    >
                        <Typography variant="caption" style={styles.label}>Start Date</Typography>
                        <Typography style={styles.dateValue}>{format(startDate, 'MMM dd, yyyy')}</Typography>
                    </TouchableOpacity>
                    <View style={{ width: SPACING.m }} />
                    <TouchableOpacity
                        style={[styles.flex1, styles.dateInput]}
                        onPress={() => setShowCalendar('END')}
                    >
                        <Typography variant="caption" style={styles.label}>End Date</Typography>
                        <Typography style={styles.dateValue}>{format(endDate, 'MMM dd, yyyy')}</Typography>
                    </TouchableOpacity>
                </View>
                <Typography variant="caption" style={styles.durationText}>{daysCount} Day{daysCount > 1 ? 's' : ''} Rental</Typography>

                <Typography variant="body" style={styles.sectionTitle}>Customer Details</Typography>
                <Input
                    label=""
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="Full Name *"
                />

                <Input
                    label=""
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                    placeholder="Phone Number *"
                    keyboardType="phone-pad"
                />

                <Input
                    value={customerAddress}
                    onChangeText={setCustomerAddress}
                    placeholder="Address (Optional)"
                    multiline
                    numberOfLines={3}
                    style={{ height: 80, textAlignVertical: 'top' }}
                />

                <Typography variant="body" style={styles.sectionTitle}>Special Discount</Typography>
                <View style={styles.discountRow}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, discountType === 'PERCENT' && styles.toggleBtnActive]}
                            onPress={() => setDiscountType('PERCENT')}
                        >
                            <Typography style={[styles.toggleText, discountType === 'PERCENT' && styles.toggleTextActive]}>%</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, discountType === 'AMOUNT' && styles.toggleBtnActive]}
                            onPress={() => setDiscountType('AMOUNT')}
                        >
                            <Typography style={[styles.toggleText, discountType === 'AMOUNT' && styles.toggleTextActive]}>₹</Typography>
                        </TouchableOpacity>
                    </View>
                    <Input
                        label=""
                        value={discountValue}
                        onChangeText={setDiscountValue}
                        placeholder={discountType === 'PERCENT' ? "Enter %" : "Enter Rs"}
                        keyboardType="numeric"
                        containerStyle={{ flex: 1, marginBottom: 0, marginLeft: SPACING.m }}
                    />
                </View>

                {selectedItem && (
                    <>
                        <Typography variant="body" style={styles.sectionTitle}>Bill Summary</Typography>
                        <View style={styles.receipt}>
                            <View style={styles.receiptGlow} />
                            <View style={styles.receiptHeader}>
                                <Typography variant="h3" style={styles.receiptTitle}>RECEIPT</Typography>
                                <Typography variant="caption" style={styles.receiptDate}>{format(new Date(), 'dd/MM/yyyy')}</Typography>
                            </View>

                            <View style={styles.receiptRow}>
                                <Typography variant="body" style={styles.receiptLabel}>{selectedItem.name}</Typography>
                                <Typography variant="body" bold style={styles.receiptValue}>₹{(originalRentalPrice / 100).toLocaleString('en-IN')}</Typography>
                            </View>
                            <Typography variant="caption" style={styles.receiptSubLabel}>₹{selectedItem.rentalPrice / 100} x {daysCount} days</Typography>

                            {discountInPaise > 0 && (
                                <View style={[styles.receiptRow, { marginTop: SPACING.s }]}>
                                    <Typography variant="body" style={[styles.receiptLabel, { color: COLORS.error }]}>Discount {discountType === 'PERCENT' ? `(${discountValue}%)` : ''}</Typography>
                                    <Typography variant="body" bold style={[styles.receiptValue, { color: COLORS.error }]}>- ₹{(discountInPaise / 100).toLocaleString('en-IN')}</Typography>
                                </View>
                            )}

                            <View style={styles.receiptRow}>
                                <Typography variant="body" style={styles.receiptLabel}>Security Deposit</Typography>
                                <Typography variant="body" bold style={styles.receiptValue}>₹{(securityDeposit / 100).toLocaleString('en-IN')}</Typography>
                            </View>

                            <View style={styles.receiptDivider} />

                            <View style={styles.receiptRow}>
                                <Typography variant="h3" style={styles.receiptTotalLabel}>Grand Total</Typography>
                                <Typography variant="h3" style={styles.receiptTotalValue}>₹{(grandTotal / 100).toLocaleString('en-IN')}</Typography>
                            </View>

                            <Input
                                label=""
                                value={paymentAmount}
                                onChangeText={setPaymentAmount}
                                placeholder="Payment Received Today (₹)"
                                keyboardType="numeric"
                                style={styles.inlinePaymentInput}
                                containerStyle={{ marginTop: SPACING.l, marginBottom: 0 }}
                            />
                        </View>
                    </>
                )}

                <Button
                    title="Confirm & Create Booking"
                    onPress={handleCreateBooking}
                    loading={loading}
                    style={styles.submitButton}
                />

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modals */}
            {renderCalendar()}

            <Modal visible={showItemPicker} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Typography variant="h2" style={styles.modalTitle}>Select Item</Typography>
                            <TouchableOpacity onPress={() => setShowItemPicker(false)}>
                                <Typography style={styles.closeText}>Close</Typography>
                            </TouchableOpacity>
                        </View>

                        <Input
                            label=""
                            placeholder="Search inventory..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            containerStyle={{ marginBottom: SPACING.m }}
                        />

                        <FlatList
                            data={filteredItems}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.itemListItem}
                                    onPress={() => {
                                        setSelectedItem(item);
                                        setShowItemPicker(false);
                                    }}
                                >
                                    <Typography style={styles.itemListName}>{item.name}</Typography>
                                    <Typography style={styles.itemListPrice}>₹{item.rentalPrice / 100}/day</Typography>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: SPACING.m,
    },
    sectionTitle: {
        color: COLORS.primary,
        letterSpacing: 2,
        marginTop: SPACING.xl,
        marginBottom: SPACING.s,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dateInput: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: 4,
    },
    dateValue: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    durationText: {
        color: COLORS.textTertiary,
        textAlign: 'right',
        fontStyle: 'italic',
        marginTop: 4,
    },
    pickerButton: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.m,
        padding: SPACING.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
    pickerButtonIcon: {
        color: COLORS.primary,
        fontSize: 18,
    },
    itemSummary: {
        backgroundColor: 'rgba(29, 185, 84, 0.05)',
        padding: SPACING.m,
        borderRadius: RADIUS.s,
        marginTop: SPACING.s,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    itemSummaryText: {
        color: COLORS.textSecondary,
    },
    itemSummaryHighlight: {
        color: COLORS.textPrimary,
        marginTop: 2,
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.s,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 4,
    },
    toggleBtn: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.xs,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.primary,
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    toggleTextActive: {
        color: COLORS.background,
    },
    receipt: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.l,
        padding: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        position: 'relative',
    },
    receiptGlow: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(29, 185, 84, 0.05)',
    },
    receiptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: SPACING.s,
    },
    receiptTitle: {
        color: COLORS.primary, // Changed to Primary as per theme
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 4,
    },
    receiptDate: {
        color: COLORS.textTertiary,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    receiptLabel: {
        color: COLORS.textSecondary,
    },
    receiptSubLabel: {
        color: COLORS.textTertiary,
        marginBottom: SPACING.s,
    },
    receiptValue: {
        color: COLORS.textPrimary,
    },
    receiptDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        borderStyle: 'dashed',
        marginVertical: SPACING.m,
    },
    receiptTotalLabel: {
        color: COLORS.textPrimary,
    },
    receiptTotalValue: {
        color: COLORS.primary,
    },
    inlinePaymentInput: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        textAlign: 'center',
        borderWidth: 0,
    },
    row: {
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        width: width * 0.9,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.l,
        padding: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    calendarNav: {
        color: COLORS.primary,
        fontSize: 30,
        paddingHorizontal: SPACING.m,
    },
    calendarMonthName: {
        color: COLORS.textPrimary,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: SPACING.s,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        color: COLORS.textTertiary,
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
        borderRadius: RADIUS.s,
    },
    dayText: {
        color: COLORS.textPrimary,
        fontSize: 15,
    },
    selectedDay: {
        backgroundColor: COLORS.primary,
    },
    selectedDayText: {
        color: COLORS.background,
        fontWeight: '700',
    },
    disabledDay: {
        opacity: 0.2,
    },
    disabledDayText: {
        color: COLORS.textTertiary,
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        height: '80%',
        width: '100%',
        marginTop: 'auto',
        padding: SPACING.l,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        color: COLORS.textPrimary,
    },
    closeText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    itemListItem: {
        paddingVertical: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemListName: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    itemListPrice: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
