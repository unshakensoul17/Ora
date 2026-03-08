import React, { useState, useEffect } from 'react';
import {
    View,
    Text, // Use Text where Typography might be limiting or for raw strings in styles
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import {
    getShopInventory,
    createWalkInBooking,
    uploadInventoryImage,
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
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

type DiscountType = 'PERCENT' | 'AMOUNT';
type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'OTHER';

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

    // Condition Images
    const [conditionImages, setConditionImages] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Discount
    const [discountType, setDiscountType] = useState<DiscountType>('AMOUNT');
    const [discountValue, setDiscountValue] = useState('');

    // Payment
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

    // UI State
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        loadInventory();
    }, [debouncedSearch, selectedCategory]);

    const loadInventory = async () => {
        if (!shop?.id) return;
        try {
            const filters: any = { status: 'ACTIVE' };
            if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
            if (selectedCategory !== 'ALL') filters.category = selectedCategory;

            const data = await getShopInventory(shop.id, filters);
            setItems(data.items);
        } catch (error) {
            console.error('Failed to load inventory:', error);
        }
    };

    // Image Picker Logic
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 0.7,
            aspect: [3, 4],
        });

        if (!result.canceled && result.assets[0]) {
            setConditionImages([...conditionImages, result.assets[0].uri]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your camera.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            aspect: [3, 4],
        });

        if (!result.canceled && result.assets[0]) {
            setConditionImages([...conditionImages, result.assets[0].uri]);
        }
    };

    const handleAddImage = () => {
        Alert.alert(
            'Add Condition Photo',
            'Choose an option',
            [
                { text: 'Camera', onPress: takePhoto },
                { text: 'Gallery', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const removeImage = (index: number) => {
        setConditionImages(conditionImages.filter((_, i) => i !== index));
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
            // 1. Upload Images
            const uploadedImageUrls: string[] = [];
            if (conditionImages.length > 0) {
                setUploadingImages(true);
                for (const uri of conditionImages) {
                    try {
                        const result = await uploadInventoryImage(shop.id, uri);
                        uploadedImageUrls.push(result.path); // Or result.url if backend expects full URL
                    } catch (err) {
                        console.warn('Image upload failed', err);
                    }
                }
                setUploadingImages(false);
            }

            // 2. Prepare Data
            const paymentAmountPaise = paymentAmount ? parseFloat(paymentAmount) * 100 : 0;
            const paymentType = paymentAmountPaise >= grandTotal ? 'FULL' : 'ADVANCE';

            // 3. Create Booking
            await createWalkInBooking({
                itemId: selectedItem.id,
                shopId: shop.id,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    address: customerAddress || undefined,
                },
                payment: {
                    method: paymentMethod,
                    amount: paymentAmountPaise,
                    type: paymentType,
                },
                conditionImages: uploadedImageUrls,
                discount: discountValue ? {
                    type: discountType === 'PERCENT' ? 'PERCENTAGE' : 'FLAT',
                    value: parseFloat(discountValue) * (discountType === 'PERCENT' ? 1 : 100), // Percent or Paise
                } : undefined,
            });

            Alert.alert('Success', 'Walk-in booking created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create booking');
        } finally {
            setLoading(false);
            setUploadingImages(false);
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

    const filteredItems = items;

    return (
        <ScreenWrapper>
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Typography style={styles.backButtonText}>←</Typography>
                    </TouchableOpacity>
                    <Typography variant="h2" style={styles.headerTitle}>New Walk-in Order</Typography>
                </View>

                {/* 1. Select Item */}
                <Typography variant="body" style={styles.sectionTitle}>1. Select Item</Typography>
                <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowItemPicker(true)}
                >
                    <Typography style={styles.pickerButtonText}>
                        {selectedItem ? selectedItem.name : '+ Select from Inventory'}
                    </Typography>
                    <Typography style={styles.pickerButtonIcon}>{selectedItem ? 'Change' : ''}</Typography>
                </TouchableOpacity>

                {selectedItem && (
                    <View style={styles.itemSummary}>
                        <Typography variant="caption" style={styles.itemSummaryText}>
                            Rental: ₹{(selectedItem.rentalPrice / 100).toLocaleString('en-IN')}/day
                        </Typography>
                        <Typography variant="caption" style={styles.itemSummaryText}>
                            Size: {selectedItem.size} | Deposit: ₹{(selectedItem.securityDeposit / 100).toLocaleString('en-IN')}
                        </Typography>
                    </View>
                )}

                {/* 2. Customer Details */}
                <Typography variant="body" style={styles.sectionTitle}>2. Customer Details</Typography>
                <Input
                    label=""
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="Customer Name"
                    containerStyle={{ marginBottom: SPACING.s }}
                />
                <Input
                    label=""
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    containerStyle={{ marginBottom: SPACING.s }}
                />
                <Input
                    value={customerAddress}
                    onChangeText={setCustomerAddress}
                    placeholder="Address (Optional)"
                    multiline
                    style={{ height: 60 }}
                />

                {/* 3. Rental Dates */}
                <Typography variant="body" style={styles.sectionTitle}>3. Rental Dates</Typography>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.flex1, styles.dateInput]}
                        onPress={() => setShowCalendar('START')}
                    >
                        <Typography variant="caption" style={styles.label}>Pickup Date</Typography>
                        <Typography style={styles.dateValue}>{format(startDate, 'yyyy-MM-dd')}</Typography>
                    </TouchableOpacity>
                    <View style={{ width: SPACING.m }} />
                    <TouchableOpacity
                        style={[styles.flex1, styles.dateInput]}
                        onPress={() => setShowCalendar('END')}
                    >
                        <Typography variant="caption" style={styles.label}>Return Date</Typography>
                        <Typography style={styles.dateValue}>{format(endDate, 'yyyy-MM-dd')}</Typography>
                    </TouchableOpacity>
                </View>

                {/* Condition Images */}
                <Typography variant="body" style={styles.sectionTitle}>4. Condition (Before Rent)</Typography>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    {conditionImages.map((uri, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image source={{ uri }} style={styles.imagePreview} />
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={() => removeImage(index)}
                            >
                                <Ionicons name="close" size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                        <Ionicons name="camera-outline" size={32} color="#D4AF37" style={{ marginBottom: 4 }} />
                        <Typography variant="caption" style={{ color: COLORS.textTertiary }}>Add Photo</Typography>
                    </TouchableOpacity>
                </ScrollView>


                {/* Payment & Discount */}
                <Typography variant="body" style={styles.sectionTitle}>5. Payment</Typography>

                {/* Discount Toggle */}
                <View style={styles.discountRow}>
                    <Typography style={{ color: COLORS.textSecondary, marginRight: SPACING.m }}>Discount:</Typography>
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
                        placeholder={discountType === 'PERCENT' ? "0%" : "₹0"}
                        keyboardType="numeric"
                        containerStyle={{ flex: 1, marginBottom: 0, marginLeft: SPACING.m }}
                        style={{ height: 40 }}
                    />
                </View>

                {selectedItem && (
                    <View style={styles.receipt}>
                        <View style={styles.receiptRow}>
                            <Typography>Total Rental ({daysCount} days)</Typography>
                            <Typography>₹{(originalRentalPrice / 100).toLocaleString('en-IN')}</Typography>
                        </View>
                        {discountInPaise > 0 && (
                            <View style={styles.receiptRow}>
                                <Typography style={{ color: COLORS.success }}>Discount</Typography>
                                <Typography style={{ color: COLORS.success }}>- ₹{(discountInPaise / 100).toLocaleString('en-IN')}</Typography>
                            </View>
                        )}
                        <View style={styles.receiptRow}>
                            <Typography>Security Deposit</Typography>
                            <Typography>₹{(securityDeposit / 100).toLocaleString('en-IN')}</Typography>
                        </View>
                        <View style={styles.receiptDivider} />
                        <View style={styles.receiptRow}>
                            <Typography bold variant="h3">Total Payable</Typography>
                            <Typography bold variant="h3" style={{ color: COLORS.primary }}>
                                ₹{(grandTotal / 100).toLocaleString('en-IN')}
                            </Typography>
                        </View>
                    </View>
                )}

                <Input
                    label="Advance Received (₹)"
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    placeholder="Enter amount received"
                    keyboardType="numeric"
                />

                <Typography variant="caption" style={styles.label}>Payment Method</Typography>
                <View style={styles.methodRow}>
                    {(['CASH', 'UPI', 'CARD', 'OTHER'] as PaymentMethod[]).map(method => (
                        <TouchableOpacity
                            key={method}
                            style={[styles.methodChip, paymentMethod === method && styles.methodChipActive]}
                            onPress={() => setPaymentMethod(method)}
                        >
                            <Typography style={[styles.methodText, paymentMethod === method && styles.methodTextActive]}>
                                {method}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    title="Create Walk-in Booking"
                    onPress={handleCreateBooking}
                    loading={loading || uploadingImages}
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
                            containerStyle={{ marginBottom: SPACING.s }}
                            clearButtonMode="while-editing"
                        />

                        <View style={{ marginBottom: SPACING.m }}>
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
                                    <View style={styles.itemThumbnailContainer}>
                                        {item.images && item.images.length > 0 ? (
                                            <Image
                                                source={{
                                                    uri: item.images[0].startsWith('http')
                                                        ? item.images[0]
                                                        : `https://zkmkapeuqbyvjxdkiljx.supabase.co/storage/v1/object/public/inventory-images/${item.images[0]}`
                                                }}
                                                style={styles.itemThumbnail}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                            />
                                        ) : (
                                            <View style={[styles.itemThumbnail, styles.placeholderThumbnail]}>
                                                <Text style={styles.placeholderText}>No Image</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.itemTextInfo}>
                                        <Typography style={styles.itemListName}>{item.name}</Typography>
                                        <Typography variant="caption" style={{ color: COLORS.textTertiary }}>
                                            {item.category} • Size {item.size}
                                        </Typography>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Typography style={styles.itemListPrice}>₹{item.rentalPrice / 100}</Typography>
                                        <Typography variant="caption" style={{ color: item.status === 'ACTIVE' ? COLORS.success : COLORS.error }}>
                                            {item.status}
                                        </Typography>
                                    </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    backButton: {
        marginRight: SPACING.m,
        padding: SPACING.s,
    },
    backButtonText: {
        color: COLORS.textPrimary,
        fontSize: 24,
    },
    headerTitle: {
        color: '#D4AF37', // Gold color from UI reference
    },
    sectionTitle: {
        color: '#D4AF37',
        marginTop: SPACING.xl,
        marginBottom: SPACING.s,
        fontSize: 16,
        fontWeight: '600',
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: 8,
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
        fontSize: 16,
        fontWeight: '500',
    },
    pickerButton: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)', // Gold tint
        borderWidth: 1,
        borderColor: '#D4AF37',
        borderRadius: RADIUS.m,
        padding: SPACING.l,
        borderStyle: 'dashed',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerButtonText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '500',
    },
    pickerButtonIcon: {
        color: '#D4AF37',
        marginLeft: SPACING.s,
    },
    itemSummary: {
        marginTop: SPACING.s,
        padding: SPACING.m,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.s,
    },
    itemSummaryText: {
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
    },
    imageScroll: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
    },
    imageContainer: {
        marginRight: SPACING.s,
        position: 'relative',
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.card,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeImageText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addImageBtn: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    addImageIcon: {
        fontSize: 24,
        marginBottom: 4,
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
        overflow: 'hidden',
    },
    toggleBtn: {
        paddingHorizontal: SPACING.m,
        paddingVertical: 8,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.primary,
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    toggleTextActive: {
        color: COLORS.background,
    },
    receipt: {
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    receiptDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.s,
    },
    methodRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.s,
        marginBottom: SPACING.xl,
    },
    methodChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    methodChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    methodText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    methodTextActive: {
        color: COLORS.background,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#D4AF37', // Gold button
        borderRadius: RADIUS.m,
        paddingVertical: 16,
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
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    calendarNav: {
        fontSize: 24,
        color: COLORS.primary,
        padding: SPACING.s,
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
    },
    dayText: {
        color: COLORS.textPrimary,
    },
    selectedDay: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.s,
    },
    selectedDayText: {
        color: COLORS.background,
        fontWeight: 'bold',
    },
    disabledDay: {
        opacity: 0.3,
    },
    disabledDayText: {
        color: COLORS.textTertiary,
    },
    modalContent: {
        backgroundColor: COLORS.background,
        width: '100%',
        height: '80%',
        marginTop: 'auto',
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
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
    },
    itemListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    itemListName: {
        color: COLORS.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    itemListPrice: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    categoryList: {
        paddingHorizontal: 0,
        paddingBottom: 4,
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeCategoryTab: {
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary,
    },
    categoryLabel: {
        color: COLORS.textTertiary,
        fontSize: 12,
        fontWeight: '500',
    },
    activeCategoryLabel: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    itemThumbnailContainer: {
        marginRight: 12,
    },
    itemThumbnail: {
        width: 40,
        height: 50,
        borderRadius: 4,
        backgroundColor: COLORS.card,
    },
    placeholderThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    placeholderText: {
        color: COLORS.textTertiary,
        fontSize: 8,
        textAlign: 'center',
    },
    itemTextInfo: {
        flex: 1,
        marginRight: 8,
    },
});
