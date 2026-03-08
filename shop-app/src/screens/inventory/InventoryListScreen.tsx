import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Switch, TextInput, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '../../store/authStore';
import { getShopInventory, deleteInventoryItem, toggleInventoryStatus } from '../../api/endpoints';
import { InventoryItem } from '../../api/types';
import { Ionicons } from '@expo/vector-icons';

const statusColors: Record<string, string> = {
    ACTIVE: '#4ade80',
    RENTED: '#fbbf24',
    MAINTENANCE: '#f87171',
    INACTIVE: '#6b7280',
};

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

export default function InventoryListScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const fetchInventory = async () => {
        if (!shop?.id) return;
        // Don't show full screen loader on search/filter updates if we already have data
        if (items.length === 0) setLoading(true);
        setError(null);
        try {
            const filters: any = {};
            if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
            if (selectedCategory !== 'ALL') filters.category = selectedCategory;

            const data = await getShopInventory(shop.id, filters);
            setItems(data.items);
        } catch (err: any) {
            console.error('Failed to fetch inventory:', err);
            setError(err.message || 'Failed to load inventory');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch on filter change
    useEffect(() => {
        fetchInventory();
    }, [shop?.id, debouncedSearch, selectedCategory]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchInventory();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInventory();
    };

    const handleToggleStatus = async (item: InventoryItem) => {
        try {
            await toggleInventoryStatus(item.id);
            fetchInventory();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to toggle status');
        }
    };

    const handleEdit = (item: InventoryItem) => {
        navigation.navigate('EditItem', { itemId: item.id });
    };

    const handleDelete = (item: InventoryItem) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteInventoryItem(item.id);
                            fetchInventory();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const formatPrice = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

    const renderItem = ({ item }: { item: InventoryItem }) => {
        const imageUrl = item.images && item.images.length > 0
            ? (item.images[0].startsWith('http')
                ? item.images[0]
                : `https://zkmkapeuqbyvjxdkiljx.supabase.co/storage/v1/object/public/inventory-images/${item.images[0]}`)
            : null;

        return (
            <TouchableOpacity
                style={styles.itemCard}
                onPress={() => handleEdit(item)}
                onLongPress={() => handleDelete(item)}
            >
                <View style={styles.thumbnailContainer}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.thumbnail}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={200}
                        />
                    ) : (
                        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.itemMeta}>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                        <Text style={styles.itemSize}>Size: {item.size}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{formatPrice(item.rentalPrice)}/day</Text>
                </View>
                <View style={styles.itemRight}>
                    <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || '#6b7280') + '20', marginBottom: 8 }]}>
                        <Text style={[styles.statusText, { color: statusColors[item.status] || '#6b7280' }]}>{item.status}</Text>
                    </View>
                    {item.status !== 'RENTED' && (
                        <View style={styles.toggleContainer}>
                            <Switch
                                value={item.status === 'ACTIVE'}
                                onValueChange={() => handleToggleStatus(item)}
                                trackColor={{ false: '#2C2C2E', true: '#D4AF37' }}
                                thumbColor={item.status === 'ACTIVE' ? '#121212' : '#f4f3f4'}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchInventory}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Inventory</Text>
                    <Text style={styles.count}>{items.length} items</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddItem')}
                >
                    <Text style={styles.addButtonText}>+ Add Item</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
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
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cube-outline" size={48} color="#D4AF37" style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyText}>No items yet</Text>
                        <Text style={styles.emptySubtext}>Add your first item to get started</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('AddItem')}
                        >
                            <Text style={styles.emptyButtonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListFooterComponent={
                    items.length > 0 ? (
                        <Text style={styles.hint}>Long press an item to delete</Text>
                    ) : null
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
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#022b1e',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    count: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#022b1e',
        fontWeight: '700',
    },
    filterSection: {
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    searchIcon: {
        fontSize: 16,
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    activeCategoryTab: {
        backgroundColor: '#D4AF3720',
        borderColor: '#D4AF37',
    },
    categoryLabel: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
    },
    activeCategoryLabel: {
        color: '#D4AF37',
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    itemCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    thumbnailContainer: {
        marginRight: 12,
    },
    thumbnail: {
        width: 50,
        height: 60,
        borderRadius: 6,
        backgroundColor: '#2a2a2a',
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
        marginRight: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    itemMeta: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 12,
        color: '#D4AF37',
    },
    itemSize: {
        fontSize: 12,
        color: '#888',
    },
    itemPrice: {
        fontSize: 14,
        color: '#4ade80',
        fontWeight: '500',
    },
    itemRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 48,
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
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#022b1e',
        fontWeight: '600',
    },
    hint: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
});
