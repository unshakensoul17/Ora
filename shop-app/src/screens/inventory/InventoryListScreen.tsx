import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getShopInventory, deleteInventoryItem } from '../../api/endpoints';
import { InventoryItem } from '../../api/types';

const statusColors: Record<string, string> = {
    ACTIVE: '#4ade80',
    RENTED: '#fbbf24',
    MAINTENANCE: '#f87171',
    INACTIVE: '#6b7280',
};

export default function InventoryListScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInventory = async () => {
        if (!shop?.id) return;
        setError(null);
        try {
            const data = await getShopInventory(shop.id);
            setItems(data.items);
        } catch (err: any) {
            console.error('Failed to fetch inventory:', err);
            setError(err.message || 'Failed to load inventory');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [shop?.id]);

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

    const renderItem = ({ item }: { item: InventoryItem }) => (
        <TouchableOpacity
            style={styles.itemCard}
            onLongPress={() => handleDelete(item)}
        >
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemMeta}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <Text style={styles.itemSize}>Size: {item.size}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.rentalPrice)}/day</Text>
            </View>
            <View style={styles.itemRight}>
                <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || '#6b7280') + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColors[item.status] || '#6b7280' }]}>{item.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                <Text style={styles.count}>{items.length} items</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddItem')}
                >
                    <Text style={styles.addButtonText}>+ Add Item</Text>
                </TouchableOpacity>
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
                        <Text style={styles.emptyIcon}>📦</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    count: {
        fontSize: 14,
        color: '#888',
    },
    addButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#022b1e',
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    itemCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    itemInfo: {
        flex: 1,
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
