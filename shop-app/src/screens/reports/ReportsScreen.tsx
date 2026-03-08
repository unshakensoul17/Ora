import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL } from '../../api/config';
import { getToken } from '../../store/secureStore';
import { ReportsIcon } from '../../components/Icons';
import { Ionicons } from '@expo/vector-icons';

// DESIGN TOKENS (Shared with Dashboard)
const COLORS = {
    background: '#121212',
    card: '#1C1C1E',
    border: '#2C2C2E',
    primary: '#D4AF37',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
};

const TYPOGRAPHY = {
    heading: { fontSize: 24, fontWeight: '700' as const },
    bodySmall: { fontSize: 12, fontWeight: '400' as const },
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

type ReportType = 'sales' | 'inventory' | 'customers';

export default function ReportsScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [loading, setLoading] = useState<ReportType | null>(null);

    const downloadReport = async (type: ReportType) => {
        if (!shop?.id) return;

        try {
            setLoading(type);
            const token = await getToken();
            const fileName = `${type}_report_${new Date().getTime()}.xlsx`;
            // Using FileSystem.cacheDirectory or documentDirectory
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            const endpoint = type === 'sales' ? '/reports/sales' :
                type === 'inventory' ? '/reports/inventory' :
                    '/reports/customers';

            const url = `${API_BASE_URL}${endpoint}?shopId=${shop.id}`;

            const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (downloadRes.status !== 200) {
                throw new Error('Failed to generate report');
            }

            // Share/Open the file
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: 'Download Report',
                    UTI: 'com.microsoft.excel.xlsx'
                });
            } else {
                Alert.alert('Success', 'Report downloaded successfully.');
            }

        } catch (error: any) {
            console.error('Download error:', error);
            Alert.alert('Error', error.message || 'Failed to download report');
        } finally {
            setLoading(null);
        }
    };

    const ReportCard = ({ title, description, type }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => downloadReport(type)}
            disabled={loading !== null}
        >
            <View style={styles.cardIcon}>
                <ReportsIcon color={COLORS.primary} size={28} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
            </View>
            <View style={styles.actionContainer}>
                {loading === type ? (
                    <ActivityIndicator color={COLORS.primary} size="small" />
                ) : (
                    <Text style={styles.downloadText}>Download</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Shop Reports</Text>
                <Text style={styles.subtitle}>Select a report to export as an Excel file</Text>
            </View>

            <View style={styles.grid}>
                <ReportCard
                    title="Sales Report"
                    description="Detailed breakdown of all earnings, payments and rental history."
                    type="sales"
                />

                <ReportCard
                    title="Inventory Performance"
                    description="Stats on which items are rented most and current inventory status."
                    type="inventory"
                />

                <ReportCard
                    title="Customer Insights"
                    description="Lifetime value of your customers and rental frequency."
                    type="customers"
                />
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="bulb-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>
                    Tip: Reports are exported in .xlsx format, which can be opened with Microsoft Excel or Google Sheets.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xxl,
        marginTop: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.heading,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    grid: {
        gap: SPACING.lg,
    },
    card: {
        backgroundColor: '#161B18',
        borderRadius: 16,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardDescription: {
        color: '#888',
        fontSize: 12,
        lineHeight: 16,
    },
    actionContainer: {
        marginLeft: SPACING.md,
        paddingLeft: SPACING.md,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
        minWidth: 80,
        alignItems: 'center',
    },
    downloadText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    infoBox: {
        marginTop: SPACING.xxl,
        padding: SPACING.lg,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        color: COLORS.primary,
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
    },
});
