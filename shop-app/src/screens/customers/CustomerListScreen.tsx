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
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

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
        <Card style={styles.customerCard}>
            <View style={styles.customerInfo}>
                <Typography variant="h3" style={styles.customerName}>{item.name}</Typography>
                <Typography variant="body" style={styles.customerPhone}>{item.phone}</Typography>
                {item.isBlacklisted && (
                    <View style={styles.blacklistBadge}>
                        <Typography style={styles.blacklistText}>BLACKLISTED</Typography>
                    </View>
                )}
            </View>
            <TouchableOpacity
                style={[styles.actionButton, item.isBlacklisted ? styles.unblockButton : styles.blockButton]}
                onPress={() => toggleBlacklist(item)}
            >
                <Typography style={styles.actionButtonText}>
                    {item.isBlacklisted ? 'Unblock' : 'Block'}
                </Typography>
            </TouchableOpacity>
        </Card>
    );

    return (
        <ScreenWrapper withPadding={false}>
            <View style={styles.header}>
                <Typography variant="h1" style={styles.title}>Customers</Typography>
                <Typography variant="caption" style={styles.count}>{customers.length} total</Typography>
            </View>

            <View style={styles.searchContainer}>
                <Input
                    label=""
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    containerStyle={{ marginBottom: 0 }}
                />
            </View>

            {loading ? (
                <View style={[styles.container, styles.center]}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
            ) : (
                <FlatList
                    data={customers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Typography variant="h1" style={styles.emptyIcon}>busts_in_silhouette</Typography>
                            <Typography variant="h3" style={styles.emptyText}>No customers found</Typography>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        color: COLORS.primary,
    },
    count: {
        color: COLORS.textSecondary,
    },
    searchContainer: {
        padding: SPACING.m,
    },
    listContent: {
        padding: SPACING.m,
        paddingTop: 0,
    },
    customerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    customerPhone: {
        color: COLORS.textSecondary,
    },
    blacklistBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: RADIUS.s,
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
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
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
    empty: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: SPACING.m,
    },
    emptyText: {
        color: COLORS.textSecondary,
    },
});
