import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuthStore } from '../../store/authStore';
import { scanBookingQR, markPickedUp, markReturned } from '../../api/endpoints';
import { ScanResult } from '../../api/types';
import { Ionicons } from '@expo/vector-icons';


export default function QRScannerScreen({ navigation }: any) {
    const shop = useAuthStore((state) => state.shop);
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifiedData, setVerifiedData] = useState<ScanResult | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
        if (loading) return;

        setIsScanning(false);
        setLoading(true);

        try {
            console.log(`Scanned: ${data}`);
            let qrCodeHash = '';

            if (data.startsWith('ora://')) {
                // Future handling for native app deep links
                const urlParts = data.split('?');
                const params = urlParts[1] || '';

                const hashMatch = params.match(/(?:hash|code)=([a-f0-9]+)/);
                if (hashMatch && hashMatch[1] && hashMatch[1] !== 'undefined') {
                    qrCodeHash = hashMatch[1];
                } else {
                    Alert.alert('Invalid QR Code', 'QR code is missing required information.');
                    setLoading(false);
                    return;
                }
            } else {
                // Handle web URLs
                const match = data.split('?')[1]?.match(/(?:hash|code)=([a-f0-9]+)/);
                if (!match || !match[1] || match[1] === 'undefined') {
                    Alert.alert('Invalid QR Code', 'QR code is missing required information.');
                    setLoading(false);
                    return;
                }
                qrCodeHash = match[1];
            }

            if (!qrCodeHash) {
                Alert.alert('Invalid QR Code', 'This does not look like an ORA QR code.');
                setLoading(false);
                return;
            }

            // Use the proper scan-qr endpoint that handles both pickup and return
            const response = await scanBookingQR(qrCodeHash, shop?.id || '');

            if (response) {
                setVerifiedData({ ...response, verified: true } as any);
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Verification Failed', error.message || 'Invalid or expired QR code.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPickup = async () => {
        if (!verifiedData?.booking?.id) return;

        setActionLoading(true);
        try {
            await markPickedUp(verifiedData.booking.id);
            Alert.alert('Success', 'Item marked as picked up!', [
                { text: 'OK', onPress: handleReset }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkReturn = async () => {
        if (!verifiedData?.booking?.id) return;

        setActionLoading(true);
        try {
            await markReturned(verifiedData.booking.id);
            Alert.alert('Success', 'Item marked as returned! Customer can now write a review.', [
                { text: 'OK', onPress: handleReset }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReset = () => {
        setVerifiedData(null);
    };

    // Permission states
    if (!permission) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.permissionIcon}>📷</Text>
                <Text style={styles.permissionText}>Camera permission is required</Text>
                <Text style={styles.permissionSubtext}>We need camera access to scan customer QR codes</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Loading state
    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.loadingText}>Verifying QR Code...</Text>
            </View>
        );
    }

    // Success state
    if (verifiedData) {
        const { booking, canPickup, canReturn } = verifiedData;

        return (
            <View style={styles.container}>
                <View style={styles.successCard}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>Verified!</Text>
                    <Text style={styles.successSubtitle}>
                        {canPickup ? 'Ready for pickup' : canReturn ? 'Ready for return' : 'Booking confirmed'}
                    </Text>

                    {/* Status Badge */}
                    <View style={[
                        styles.statusBadge,
                        canReturn ? styles.statusBadgeReturn : styles.statusBadgePickup
                    ]}>
                        <View style={styles.iconTextRow}>
                            <Ionicons name={booking.status === 'RENTED' ? 'return-down-back' : 'cube-outline'} size={14} color="#000" style={{ marginRight: 6 }} />
                            <Text style={styles.statusBadgeText}>
                                {booking.status === 'RENTED' ? 'RETURN' : 'PICKUP'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Customer</Text>
                            <Text style={styles.detailValue}>{booking.user.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{booking.user.phone}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Item</Text>
                            <Text style={styles.detailValue}>{booking.item.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Dates</Text>
                            <Text style={styles.detailValue}>
                                {new Date(booking.dates.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.dates.end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Rental Price</Text>
                            <Text style={[styles.detailValue, { color: '#D4AF37' }]}>
                                ₹{(booking.item.rentalPrice / 100).toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Security Deposit</Text>
                            <Text style={styles.detailValue}>
                                ₹{(booking.item.securityDeposit / 100).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    </View>

                    {!canReturn && (
                        <View style={styles.billableNoteContainer}>
                            <Ionicons name="cash-outline" size={16} color="#d97706" style={{ marginRight: 6 }} />
                            <Text style={styles.billableNoteText}>₹50 lead fee applied to your account</Text>
                        </View>
                    )}

                    <View style={styles.actionButtons}>
                        {canPickup && (
                            <TouchableOpacity
                                style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
                                onPress={handleMarkPickup}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator color="#022b1e" />
                                ) : (
                                    <View style={styles.actionButtonContent}>
                                        <Ionicons name="checkmark" size={18} color="#022b1e" style={{ marginRight: 6 }} />
                                        <Text style={styles.primaryButtonText}>Mark Picked Up</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}

                        {canReturn && (
                            <TouchableOpacity
                                style={[styles.returnButton, actionLoading && styles.buttonDisabled]}
                                onPress={handleMarkReturn}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.actionButtonContent}>
                                        <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.returnButtonText}>Mark Returned</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
                            <Text style={styles.secondaryButtonText}>Scan Another</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // Scanner view
    return (
        <View style={styles.container}>
            {isScanning ? (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                >
                    <View style={styles.scanOverlay}>
                        <View style={styles.scanFrame} />
                        <Text style={styles.scanHint}>Point camera at customer's QR code</Text>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsScanning(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                <View style={styles.scanArea}>
                    <Text style={styles.icon}>📷</Text>
                    <Text style={styles.title}>Scan Customer QR</Text>
                    <Text style={styles.subtitle}>
                        Ask the customer to show their QR code from the ORA app
                    </Text>
                    <TouchableOpacity style={styles.scanButton} onPress={() => setIsScanning(true)}>
                        <Text style={styles.scanButtonText}>Start Camera</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isScanning && (
                <View style={styles.instructions}>
                    <Text style={styles.instructionsTitle}>How it works</Text>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>1</Text>
                        <Text style={styles.stepText}>Customer shows their reservation QR</Text>
                    </View>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>2</Text>
                        <Text style={styles.stepText}>Scan to verify the booking</Text>
                    </View>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>3</Text>
                        <Text style={styles.stepText}>Mark as picked up to start rental</Text>
                    </View>
                    <View style={styles.step}>
                        <Text style={styles.stepNumber}>4</Text>
                        <Text style={styles.stepText}>On return, scan same QR and mark as returned</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    permissionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    permissionSubtext: {
        color: '#888',
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#022b1e',
        fontWeight: '600',
    },
    loadingText: {
        color: '#D4AF37',
        marginTop: 16,
        fontSize: 16,
    },
    scanArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 64,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 32,
    },
    scanButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 12,
    },
    scanButtonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: '600',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#D4AF37',
        backgroundColor: 'transparent',
        borderRadius: 12,
    },
    scanHint: {
        color: '#fff',
        marginTop: 24,
        fontSize: 14,
    },
    cancelButton: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 20,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    instructions: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    instructionsTitle: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2a2a2a',
        color: '#fff',
        textAlign: 'center',
        lineHeight: 24,
        marginRight: 12,
        fontSize: 12,
    },
    stepText: {
        color: '#888',
        fontSize: 14,
        flex: 1,
    },
    successCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4ade80',
    },
    successSubtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 32,
    },
    detailsCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        color: '#888',
        fontSize: 14,
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#2a2a2a',
        marginVertical: 8,
    },
    billableNoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    billableNoteText: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtons: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    primaryButtonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#2a2a2a',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 24,
    },
    statusBadgePickup: {
        backgroundColor: '#D4AF37',
    },
    statusBadgeReturn: {
        backgroundColor: '#4ade80',
    },
    statusBadgeText: {
        color: '#022b1e',
        fontSize: 14,
        fontWeight: '600',
    },
    returnButton: {
        backgroundColor: '#4ade80',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    returnButtonText: {
        color: '#022b1e',
        fontSize: 16,
        fontWeight: '600',
    },
});
