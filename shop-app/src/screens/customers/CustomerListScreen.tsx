import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getShopCustomers, updateCustomer } from '../../api/endpoints';
import { Customer } from '../../api/types';

const COLORS = {
    background: '#0B0F0D',
    card: '#101814',
    border: '#1F2A23',
    primary: '#1DB954',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    error: '#EF4444',
};

export default function CustomerListScreen() {
    const shop = useAuthStore((state) => state.shop);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCustomers();
    }, [searchQuery]);

    const loadCustomers = async () => {
        if (!shop?.id) return;
        try {
            const data = await getShopCustomers(shop.id, searchQuery);
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBlacklist = async (customer: Customer) => {
        if (!shop?.id) return;
        try {
            await updateCustomer(customer.id, shop.id, {
                isBlacklisted: !customer.isBlacklisted,
            });
            loadCustomers();
            Alert.alert('Success', `Customer ${!customer.isBlacklisted ? 'blacklisted' : 'removed from blacklist'}`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update customer');
        }
    };

    const renderItem = ({ item }: { item: Customer }) => (
        <View style={styles.customerCard}>
            <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerPhone}>{item.phone}</Text>
                {item.isBlacklisted && (
                    <View style={styles.blacklistBadge}>
                        <Text style={styles.blacklistText}>BLACKLISTED</Text>
                    </View>
                )}
            </View>
            <TouchableOpacity
                style={[styles.actionButton, item.isBlacklisted ? styles.unblockButton : styles.blockButton]}
                onPress={() => toggleBlacklist(item)}
            >
                <Text style={styles.actionButtonText}>
                    {item.isBlacklisted ? 'Unblock' : 'Block'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name or phone..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={customers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No customers found</Text>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16,
    },
    searchInput: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 16,
        color: COLORS.textPrimary,
        fontSize: 16,
        marginBottom: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    customerCard: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    customerPhone: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    blacklistBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    blacklistText: {
        color: COLORS.error,
        fontSize: 10,
        fontWeight: '700',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    blockButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    unblockButton: {
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 40,
    },
});
